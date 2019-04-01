/* server.js - mar 11 -10am*/
'use strict';
const log = console.log;

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const bodyParser = require('body-parser'); // middleware for parsing HTTP body
const {ObjectID} = require('mongodb');

const {mongoose} = require('./app/mongoose.js');
const {Book, User, Chapter, Comment} = require('./app/Models/modules.js');
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }))





app.use(session({
	secret: 'oursecret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: 600000,
		httpOnly: true
	}
}))

// use to redirect to home if already logged in
const sessionChecker = (req, res, next) => {
	if (req.session.user) {
		res.redirect('/index')
	} else {
		next();
	}
}

// use to redirect if a session has not been created
const sessionCheckLoggedIn = (req, res, next) => {
	if (!req.session.user) {
		res.redirect('/login')
	} else {
		next();
	}
}

/* ------------ Begin Routes Helpers ------------ */
app.get('/', (req, res) => {
    res.redirect('/index')
    // res.sendFile('../HTML/index.html', {root: __dirname })
});

// route for login
app.route('/login')
	.get(sessionChecker, (req, res) => {
		res.sendFile(__dirname + '/public/HTML/login.html')
})

app.get('/index', (req, res) => {
    // check if we have active session cookie
    res.sendFile(__dirname + '/public/HTML/index.html');
	// if (req.session.user) {
	// 	res.sendFile(__dirname + '/public/HTML/index.html')
	// } else {
	// 	res.redirect('/login')
	// }
})

app.post('/user/login', (req, res) => {
	const username = req.body.username
	const password = req.body.password

	User.findByUsernamePassword(username, password).then((user) => {
		if(!user) {
            // TODO SEND "invalid username/password error"
			res.status(404).send()
		} else {
			// Add the user to the session cookie that we will
            // send to the client
            
			req.session.user = user._id;
			req.session.name = user.name
			res.redirect('/index')
		}
	},(result) => {
        res.status(404).send()
    }).catch((error) => {
        // TODO SEND "invalid request error"
		res.status(400).send()
	})
})

app.get('/users/logout', sessionCheckLoggedIn, (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error)
		} else {
			res.redirect('/index')
		}
	})
})

// route for signup
app.route('/signup')
	.get(sessionChecker, (req, res) => {
		res.sendFile(__dirname + '/public/HTML/signUp.html')
})


app.post('/user/signup', (req, res) => {
	// Create a new user
	const user = new User({
        name: req.body.username,
        bookshelf: [],
        writtenBook: [],
        followers: 0,
        email: req.body.email,
        image: "../img/avatar.jpg",
        following: [],
        password: req.body.password
    })
    
    req.session.user = user._id;
	req.session.email = user.email

	// save user to database
	user.save().then((result) => {
        //TODO possible validation
        res.send(user)
        // res.redirect("/index");        
	}, (error) => {
		res.status(400).send(error) // 400 for bad request
	})

})





















/* Routes for books */
app.get('/db/books/:id', (req, res) => {
    const id = req.params.id;
    // Validate the id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // Otherwise, find book by id and send back
    Book.findBookByID(id)
        .then((book) => {
            if (!book) {
                return res.status(404).send();
            } else {
                res.send(book);
            }
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});

app.get('/books/:id', (req, res) => {
    const id = req.params.id;
    Book.findBookByID(id)
        .then((book) => {
            if (!book) {
                return res.status(404).send();
            } else {
                const dir = path.join(__dirname + "/public/HTML/");
                res.sendFile(dir + 'book.html');
            }
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});


app.get('/db/books', (req, res) => {
    Book.find()
        .then((books) => {
            res.send(books);
        })
        .catch(error => {
                return res.status(500).send(error);
            }
        );
});

app.put('/db/fuzzySearch', (req, res) => {
    log(req.body.word);
    Book.fuzzySearch(req.body.word)
        .then((books) => {
            res.send(books);
        })
        .catch(error => {
                return res.status(500).send(error);
            }
        );
});

app.get('/search', (req, res) => {
    const dir = path.join(__dirname + "/public/HTML/");
    res.sendFile(dir + 'search.html');
});

app.post('/db/books', (req, res) => {
    const newBook = new Book({
        "bookTitle": req.body.bookTitle,
        // "rating": req.body.rating,
        // "numOfRate": req.body.numOfRate,
        // "user": req.body.user,
        "image": req.body.image,
        "description": req.body.description,
        "genre": req.body.genre
    });

    // Check if the inputs are valid
    // if (!newBook.bookTitle || !newBook.rating || !newBook.numOfRate || !newBook.user || !newBook.description) {
    //     return res.status(400).send();
    // }
    if (!newBook.bookTitle || !newBook.description) {
        return res.status(400).send();
    }

    newBook.save()
        .then((book) => {
            res.send(book);
        })
        .catch(error => {
            return res.status(400).send(error);
        });

});

app.get('/db/books/:id', (req, res) => {
    const id = req.params.id;

    // Validate the id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // Otherwise, find book by id and send back
    Book.findBookByID(id)
        .then((book) => {
            if (!book) {
                return res.status(404).send();
            } else {
                res.send(book);
            }
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});

app.post('/db/booksChapter/:id', (req, res) => {
    // Validate the id
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Book.addChapter(req.body.chapterTitle, req.body.content, id).then(result=>res.send(result));

    // Check if the inputs are valid
    // const newChapter = new Chapter({
    //     "chapterTitle": req.body.chapterTitle,
    //     "content": req.body.content
    // });
    // if (!newChapter.chapterTitle || !newChapter.content)
    //     return res.status(400).send();
    //
    // // Otherwise, find book by id and send back
    // Book.findBookByID(id)
    //     .then((book) => {
    //         // Save chapter to queried book
    //         book.addChapter(req.body.chapterTitle, req.body.content, book);
    //
    //         // book.chapters.push(newChapter);
    //         // book.save().then(
    //         //     (updated) => {
    //         //         res.send({
    //         //             "reservation": newChapter,
    //         //             "restaurant": updated
    //         //         });
    //         //     }, (error) => {
    //         //         return res.status(400).send(error); // 400 for bad request
    //         //     });
    //     })
    //     .catch((error) => {
    //         return res.status(500).send(error);
    //     });

});
app.post('/db/booksComment/:id', (req, res) => {
    // Validate the id
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Book.addComments(req.body.user, req.body.content, id).then(result => res.send(result));
});

app.delete('/db/books/:id/:chapter_id', (req, res) => {
    // Validate the id and reservation id
    const id = req.params.id;
    const chapter_id = req.params.chapter_id;
    if (!ObjectID.isValid(id) || !ObjectID.isValid(chapter_id)) {
        return res.status(404).send();
    }

    // If valid, find the book
    Book.findBookByID(id)
        .then((book) => {
            if (!book) {
                return res.status(404).send();
            } else {
                // Find the queried chapter
                const chap = book.chapters.id(chapter_id);
                if (chap) {
                    book.deleteChapter(book.id, chap.id);
                } else {
                    return res.status(404).send();
                }
            }
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});

app.patch('/db/books/:id/:chapter_id', (req, res) => {
    // Validate the id and reservation id
    const id = req.params.id;
    const chapter_id = req.params.chapter_id;
    if (!ObjectID.isValid(id) || !ObjectID.isValid(chapter_id)) {
        return res.status(404).send();
    }

    // If valid, find the book
    Book.findBookByID(id)
        .then((book) => {
            if (!book) {
                return res.status(404).send();
            } else {
                // Find the queried chapter
                const chap = book.chapters.id(chapter_id);
                if (chap) {
                    book.updateDescription(req);
                } else {
                    return res.status(404).send();
                }
            }

        })
        .catch((error) => {
            return res.status(500).send(error);
        });

});

/* Routes for users */
// TODO - to be edited after User Schema is posted
app.get('/db/users/:id', (req, res) => {
    const id = req.params.id;
    User.findUserById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).send();
            } else {
                res.send(user);
            }
        })
        .catch((error) => {
            return res.status(500).send(error);
        });
});

app.get('/db/users', (req, res) => {
    User.find()
        .then((users) => {
            res.send(users);
        })
        .catch(error => {
                return res.status(500).send(error);
            }
        );
});

// // Set up a POST route to *create* a student
// app.post('/book', (req, res) => {
//     Book.addBook(req).then((result) => {
//         log(result);
//         res.send(result);
//     })
//         .catch((rej) => {
//             res.status(rej.code).send(rej.error);
//         });
// });
//
// app.post('/find', (req, res) => {
//     Book.findBook(req).then((result) => {
//         res.send(result);
//         return result;
//     }).then(
//         (result) => {
//             log(result[0].image);
//             result[0].addChapter(req, result[0]);
//         }
//     )
//         .catch((rej) => {
//             res.status(rej.code).send(rej.error);
//         });
// });
//
// app.patch('/updateDesription', (req, res) => {
//     Book.updateDesription(req).then((result) => {
//         log(result);
//         res.send(result);
//     })
//         .catch((rej) => {
//             res.status(rej.code).send(rej.error);
//         });
// });


// app.post('/newChapter',(req,res)=>{
//    Chapter.
// });




const port = process.env.PORT || 3000;
app.listen(port, () => {
    log('Listening on port 3000...');
});  // common local host development port 3000
// we've bound that port to localhost to go to our express server
// Must restart web server whenyou make changes to route handlers

