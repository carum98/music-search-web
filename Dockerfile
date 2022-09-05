FROM alpine:3.16.2

RUN apk update \
	&& apk add lighttpd \
	&& rm -rf /var/cache/apk/*

COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

COPY . /var/www/html/

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]