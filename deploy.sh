#!/usr/bin/env bash

# This is a script for deploying the ui using cli

set -e

CLOUD_DRIVE_CLOUDFRONT_DISTRIBUTION=E27LQCUGCQDFN6 
CLOUD_DRIVE_BUCKET_NAME=dev-cloud-drive-app

# metadata about ui version
COMMIT_BRANCH="$(git branch | grep \* | cut -d ' ' -f2)"
COMMIT_OBJECT_REFERENCE="$(git rev-parse --short=8 HEAD)"
REACT_APP_DASHBOARD_VERSION="$COMMIT_BRANCH $COMMIT_OBJECT_REFERENCE"

npm run test
npm run build

cat << EOF
Deploy about to begin!
  REACT_APP_DASHBOARD_VERSION=$REACT_APP_DASHBOARD_VERSION
  CLOUD_DRIVE_BUCKET_NAME=$CLOUD_DRIVE_BUCKET_NAME
EOF

# recommended by creat-react-app cache controls
# https://facebook.github.io/create-react-app/docs/production-build
aws s3 sync ./build/static "s3://${CLOUD_DRIVE_BUCKET_NAME}/static" --cache-control max-age=3156000
aws s3 sync ./build/ "s3://${CLOUD_DRIVE_BUCKET_NAME}" --exclude "static/*" --cache-control no-cache

function invalidation_id {
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUD_DRIVE_CLOUDFRONT_DISTRIBUTION}" \
    --paths '/*' \
    --query Invalidation.Id \
    --output text
}

aws cloudfront wait invalidation-completed \
  --distribution-id "${CLOUD_DRIVE_CLOUDFRONT_DISTRIBUTION}" \
  --id "$(invalidation_id)"
