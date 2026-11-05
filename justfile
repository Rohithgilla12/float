# Release flow: `just release patch` pushes a version tag, CI builds a signed and
# notarised draft release, and `just publish` checks it and ships the update.

set shell := ["bash", "-euo", "pipefail", "-c"]

repo := "Rohithgilla12/float"
version_files := "package.json package-lock.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock"

[private]
default:
    @just --list

# Print the current version
version:
    @node -p "require('./package.json').version"

# Set the version in every manifest and lockfile: patch, minor, major, or X.Y.Z
bump level:
    @node scripts/bump-version.mjs {{level}}

# Bump, check, commit, tag, and push; CI then builds the draft release
release level:
    #!/usr/bin/env bash
    set -euo pipefail
    [[ "$(git branch --show-current)" == main ]] || { echo "Release from main."; exit 1; }
    [[ -z "$(git status --porcelain)" ]] || { echo "Commit or stash your changes first."; exit 1; }
    git fetch --quiet origin main
    [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "main is not in sync with origin/main."; exit 1; }

    version=$(node scripts/bump-version.mjs {{level}})
    if git rev-parse -q --verify "refs/tags/v$version" >/dev/null; then
      git checkout -- {{version_files}}
      echo "Tag v$version already exists."; exit 1
    fi

    npx tsc --noEmit
    (cd src-tauri && cargo check --quiet)

    git add {{version_files}}
    git commit --quiet -m "chore: release $version"
    git tag "v$version"
    git push --quiet origin main "v$version"
    echo "Pushed v$version. The release build takes about 13 minutes; then run: just publish"

# Wait for the release build, check the draft, and publish it to every install
publish version=`node -p "require('./package.json').version"`:
    #!/usr/bin/env bash
    set -euo pipefail
    tag="v{{version}}"

    run=$(gh run list -R {{repo}} --workflow release.yml --branch "$tag" -L 1 --json databaseId -q '.[0].databaseId')
    [[ -n "$run" ]] || { echo "No release build found for $tag."; exit 1; }
    echo "Waiting for release build $run..."
    gh run watch "$run" -R {{repo}} --exit-status --interval 30 >/dev/null

    dir=$(mktemp -d)
    mount=""
    cleanup() { [[ -n "$mount" ]] && hdiutil detach -quiet "$mount"; rm -rf "$dir"; }
    trap cleanup EXIT

    gh release download "$tag" -R {{repo}} -D "$dir" -p latest.json -p "Float_{{version}}_universal.dmg"
    feed=$(node -p "require('$dir/latest.json').version")
    [[ "$feed" == "{{version}}" ]] || { echo "latest.json says $feed, expected {{version}}."; exit 1; }

    mount=$(hdiutil attach -nobrowse -readonly "$dir/Float_{{version}}_universal.dmg" 2>/dev/null | awk -F'\t' '/Volumes/{print $NF}')
    app="$mount/Float.app"
    bundle=$(defaults read "$app/Contents/Info.plist" CFBundleShortVersionString)
    [[ "$bundle" == "{{version}}" ]] || { echo "Float.app is $bundle, expected {{version}}."; exit 1; }
    xcrun stapler validate "$app" >/dev/null
    spctl -a -vv "$app" 2>&1 | grep -q "source=Notarized Developer ID" || { echo "Gatekeeper rejected Float.app."; exit 1; }
    echo "Checked: feed and app are {{version}}, app is notarised and accepted by Gatekeeper."

    gh release edit "$tag" -R {{repo}} --draft=false --latest >/dev/null
    echo "Published https://github.com/{{repo}}/releases/tag/$tag"

# Release and publish in one go
ship level:
    just release {{level}}
    just publish

# Downloads per release: dmg = new installs, checks = update checks (one per app launch), updates = auto-updates
stats:
    #!/usr/bin/env bash
    set -euo pipefail
    gh api "repos/{{repo}}/releases" --paginate --jq '.[] | [.tag_name,
        ([.assets[] | select(.name | endswith(".dmg")) | .download_count] | add // 0),
        ([.assets[] | select(.name == "latest.json") | .download_count] | add // 0),
        ([.assets[] | select(.name | endswith(".app.tar.gz")) | .download_count] | add // 0)] | @tsv' |
      awk -F'\t' 'BEGIN { printf "%-9s %6s %7s %8s\n", "release", "dmg", "checks", "updates" }
        { printf "%-9s %6d %7d %8d\n", $1, $2, $3, $4; d += $2; c += $3; u += $4 }
        END { printf "%-9s %6d %7d %8d\n", "total", d, c, u }'
    echo "Site analytics: https://analytics.gilla.fun (website: Float)"
