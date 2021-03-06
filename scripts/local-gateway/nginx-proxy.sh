#!/bin/bash

#
# This script runs NGINX as a reverse proxy as a docker container
# It expects to find DAPR_HTTP_PORT variable, so always run via `dapr run`
#

echo "### API gateway nginx wrapper magic doohicky script"
echo "### Dapr port is $DAPR_HTTP_PORT"
echo "### Starting nginx in docker"

sed -i "s/localhost:[[:digit:]]\+; #dapr/localhost:$DAPR_HTTP_PORT; #dapr/g" dapr.conf

docker run --rm --network host -p 9000:9000 --mount type=bind,source=$(pwd),target=/etc/nginx/conf.d/ --name api-gateway nginx:alpine