NAME_CONTAINER=peerplays-witness-monitor

container:
	docker rmi ${NAME_CONTAINER} | docker build -t ${NAME_CONTAINER} .

run: container
	docker run --restart=always -itd --name=${NAME_CONTAINER} ${NAME_CONTAINER}

log:
	docker logs -f ${NAME_CONTAINER} --tail=100

attach:
	docker attach ${NAME_CONTAINER}

enter:
	docker exec -it ${NAME_CONTAINER} bash

stop:
	docker stop ${NAME_CONTAINER}

delete:
	docker rm -f ${NAME_CONTAINER}