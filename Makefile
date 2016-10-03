all: docker-run

# Useful commands for building and running docker
imagename=fabric
docker-build:
	docker build -t $(imagename) .
docker-run:
	docker run -ti \
    -v $(CURDIR)/src:/usr/src/app/src/ \
    -v $(CURDIR)/lib:/usr/src/app/lib/ \
    -v $(CURDIR)/test:/usr/src/app/test/ \
    -v $(CURDIR)/dist:/usr/src/app/dist/ \
    $(imagename)
docker-debug:
	docker run -ti  \
		-v $(CURDIR):/usr/src/app/ \
		$(imagename) bash
