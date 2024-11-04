ifneq (,$(wildcard ./.env))
include .env
export 
ENV_FILE_PARAM = --env-file .env

endif

build:
	docker-compose up --build -d --remove-orphans

build-staging:
	docker-compose -f docker-compose-staging.yml up --build -d --remove-orphans

up:
	docker-compose up -d

up-staging:
	docker-compose -f docker-compose-staging.yml up -d

down:
	docker-compose down

down-staging:
	docker-compose -f docker-compose-staging.yml down

push-hub:
	docker push myworkafrica/myworkafrica-staging-api:latest
	
show-logs:
	docker-compose logs

show-logs-staging:
	docker-compose -f docker-compose-staging.yml logs

run:
	npm run dev

init:
	npm run seed

test:
	npm run test