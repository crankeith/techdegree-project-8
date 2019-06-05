'use strict';

const Sequelize = require('sequelize');

module.exports = ( sequelize ) => {
    class Book extends Sequelize.Model {}
    Book.init({
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Title cannot be empty.'
                }
            }
        },
        author: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Author cannot be empty.'
                }
            }
        },
        genre: {
            type: Sequelize.STRING
        },
        year: {
            type: Sequelize.INTEGER,
            validate:{
                isInt: {
                    msg: 'Year must be a whole number.'
                }
            }
        }
    },{ sequelize });

    return Book;
};