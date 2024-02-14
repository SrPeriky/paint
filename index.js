// Setting up libraries and configuration
var express = require('express')		// The require() function includes the code for Express
var app = express()					// Initialize the Express library
var http = require('http').Server(app)	// Initialize an HTTP server
var io = require('socket.io')(http)	// Include and initialize SocketIO
var port = 3010
const sqlite3 = require('sqlite3').verbose()

// Conectar a la base de datos SQLite
const db = new sqlite3.Database(':memory:')

// Crear la tabla para almacenar los objetos
db.serialize(() => {
	db.run('CREATE TABLE drawings (lastX INTEGER, lastY INTEGER, x INTEGER, y INTEGER, color TEXT, brushSize INTEGER)')
})

// Use Express to serve everything in the "public" folder as static files
app.use(express.static('public'))

// Endpoint para obtener todos los objetos de la base de datos
app.get('/drawings', (req, res) => {
	db.all('SELECT * FROM drawings', (err, rows) => {
		if (err) {
			console.error('Error al obtener datos de la base de datos:', err)
			res.status(500).send('Error interno del servidor')
		} else {
			res.json(rows)
		}
	})
})

// Activate the server and listen on our specified port number
http.listen(port, function () {
	// Display this message in the server console once the server is active
	console.log('Listening on port ' + port)
})

// When a user connects over websocket,
io.on('connection', function (socket) {

	// Display this message in the server console
	console.log('A user connected!')

	// When the server receives a message named "new line",
	socket.on('new line', function (newDrawing) {
		const { lastX, lastY, x, y, color, brushSize } = newDrawing
		db.run('INSERT INTO drawings (lastX, lastY, x, y, color, brushSize) VALUES (?, ?, ?, ?, ?, ?)',
			[lastX, lastY, x, y, color, brushSize],
			function (err) {
				if (err) console.error('Error al insertar en la base de datos:', err)
			})
		socket.broadcast.emit('new line', newDrawing)
	})

})	// End of SocketIO code
