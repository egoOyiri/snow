var Q = require('q')
, users = module.exports = {}

users.configure = function(app, conn) {
    app.get('/whoami', users.whoami.bind(users, conn))
    app.post('/public/users', users.create.bind(users, conn))
}

users.whoami = function(conn, req, res, next) {
	conn.query({
		text: 'SELECT email FROM "user" WHERE user_id = $1',
		values: [req.security.userId]
	}, function(err, dres) {
		if (err) return next(err)
		if (!dres.rows.length) return res.send(404)
		res.send(dres.rows[0])
	})
}

users.create = function(conn, req, res, next) {
    Q.ninvoke(conn, 'query', {
        text: 'select create_user($1, $2) user_id',
        values: [req.body.key, req.body.secret]
    })
    .then(function(cres) {
        res.send(201, { user_id: cres.rows[0].user_id })
    }, next)
    .done()
}
