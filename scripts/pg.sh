#!/usr/bin/env bash
# 로컬 PostgreSQL 제어 스크립트
# - DB 엔진: Micromamba 환경 `pg` (PostgreSQL 18)
# - 데이터 디렉터리: 이 저장소의 data/ (git 미추적)
# 사용법: scripts/pg.sh {start|stop|status|restart|psql}
set -euo pipefail

PG_ENV="${PG_ENV:-/home/lsmin/.micromamba/envs/pg}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="${PGDATA:-$REPO_ROOT/data}"
PGPORT="${PGPORT:-5432}"
export PATH="$PG_ENV/bin:$PATH"

cmd="${1:-status}"
case "$cmd" in
  start)
    pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" -o "-p $PGPORT" start
    ;;
  stop)
    pg_ctl -D "$PGDATA" stop -m fast
    ;;
  restart)
    pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" -o "-p $PGPORT" restart -m fast
    ;;
  status)
    pg_ctl -D "$PGDATA" status
    ;;
  psql)
    shift || true
    psql -h localhost -p "$PGPORT" -U lsmin -d feature_catalog "$@"
    ;;
  *)
    echo "usage: scripts/pg.sh {start|stop|status|restart|psql}" >&2
    exit 2
    ;;
esac
