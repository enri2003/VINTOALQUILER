#!/bin/sh
set -e
RESOLVER_IP=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
if [ -z "$RESOLVER_IP" ]; then
  RESOLVER_IP=127.0.0.11
fi
case "$RESOLVER_IP" in
  *:*) RESOLVER_ADDR="[$RESOLVER_IP]:53" ;;
  *) RESOLVER_ADDR="$RESOLVER_IP" ;;
esac
sed -i "s/RESOLVER_IP_PLACEHOLDER/$RESOLVER_ADDR/" /etc/nginx/conf.d/default.conf
echo "nginx resolver set to $RESOLVER_ADDR"
