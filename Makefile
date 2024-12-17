DOCKER_FILE = ./docker-compose.yml

.PHONY: all up down re clean fclean

all: up


up :
	docker-compose -f $(DOCKER_FILE) up --build -d

upd:
	docker-compose -f $(DOCKER_FILE) up -d --build

down:
	docker-compose -f $(DOCKER_FILE) down

downv:
	docker-compose -f $(DOCKER_FILE) down -v

URL="https://localhost:4430"

open:
	@echo "Ouverture de Google Chrome en mode navigation privée avec l'URL $(URL)..."
	@google-chrome --incognito --new-window "$(URL)" &

duo:
	@echo "Ouverture de Google Chrome en mode navigation privée avec l'URL $(URL)..."
	@google-chrome --incognito --new-window "$(URL)" &
	@echo "Ouverture de Mozilla Firefox en mode navigation privée avec l'URL $(URL)..."
	@firefox --private-window "$(URL)" &

re: downv up

clean: down
	docker system prune -af --volumes

fclean: clean
	docker builder prune --all -f%                                    
