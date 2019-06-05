const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//Get all books
router.get('/', (req, res, next) => {
    const { searchString, page, limit } = req.query;
    const defaultPageSize = 5;
    let totalBooks;

    //Set options for count total books
    const countTotalOptions = {
        attributes: {
            include: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'total_books']]
        }
    };

    //Set options for filtered book list
    const filteredOptions = {
        limit: limit || defaultPageSize,
        offset: page * limit || 0
    };

    //Add search string to options if present
    if( searchString ){
        const likeClause = {
            [Op.or]: [
                {
                    title: {
                        [Op.like]: `%${searchString}%`
                    }
                },
                {
                    author: {
                        [Op.like]: `%${searchString}%`
                    }
                },
                {
                    genre: {
                        [Op.like]: `%${searchString}%`
                    }
                },
                {
                    year: {
                        [Op.like]: `%${searchString}%`
                    }
                },
            ]
        };

        countTotalOptions["where"] = likeClause;
        filteredOptions["where"] = likeClause;
    }

    //Calculate total books in DB for pagination
    Book.findAll(countTotalOptions).then( books => {
        totalBooks = books[0].get('total_books')
    });

    //Retrieve filtered book list for rendering
    Book.findAll(filteredOptions).then( books => {
        res.render('books', {
            books: books,
            search: searchString,
            currentPage: Number(page) || 0,
            limit: Number(limit) || defaultPageSize,
            pages: Math.ceil(totalBooks/(limit || defaultPageSize))
        })
    }).catch(err => {
        console.error(err);
        next(err)
    })
});

//Display new book form
router.get('/new', (req, res) => {
    res.render('books/new', { book: Book.build() })
});

//Create a new book
router.post('/', (req,res,next) => {
    Book.create(req.body).then(() => {
        res.redirect('/');
    }).catch( err => {
        if(err.name === "SequelizeValidationError"){
            res.render('books/new', { book: Book.build(req.body), errors: err.errors})
        } else {
            throw err;
        }
    }).catch( err => {
        next(err);
    })
});

//Display a single book
router.get('/:id', (req, res, next) => {
    Book.findByPk(req.params.id)
        .then( book => {
            if(book){
                res.render('books/edit', { book: book })
            } else {
                res.send(404);
            }
        }).catch( err => {
            next(err);
        })
});

//Edit a book
router.put('/:id', (req, res, next) => {
    Book.findByPk(req.params.id)
        .then( book => {
            if(book) {
                book.update(req.body).then(() => {
                    res.redirect(`/books`);
                }).catch(err => {
                    if (err.name === "SequelizeValidationError") {
                        let book = Book.build(req.body);
                        book.id = req.params.id;

                        res.render('books/edit', {book: book, errors: err.errors})
                    } else {
                        throw err;
                    }
                }).catch(err => {
                    next(err);
                })
            } else {
                res.send(404);
            }
        }).catch( err => {
            next(err);
        })
});

//Delete a book
router.delete('/:id', (req, res, next) => {
    Book.findByPk(req.params.id)
        .then( book => {
            if(book){
                book.destroy();
            } else {
                res.send(404)
            }
        }).then( () => {
            res.redirect('/');
        }).catch( err => {
            next(err);
        })
});



module.exports = router;