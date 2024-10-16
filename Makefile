DOCKER_FILE = ./docker-compose.yml

.PHONY: all up down re clean fclean

all: up


up :
	docker-compose -f $(DOCKER_FILE) up --build

upd:
	docker-compose -f $(DOCKER_FILE) up -d --build

down:
	docker-compose -f $(DOCKER_FILE) down



re: down up

clean: down
	docker system prune -af --volumes

fclean: clean
	docker builder prune --all -f%                                    