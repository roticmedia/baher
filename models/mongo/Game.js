const mongoose = require('mongoose');

const { Schema } = mongoose;

const Game = new Schema({
    token: String,
    competitors: Number,
    monasabat: String,
    coin_questions: Number,
    foop_questions: Number,
    award_title: String,
    winners: [{
        type: Number,
    }],
    matches: [{
        id: Number,
        totalScore: Number,
        player: {
            id: Number,
            name: String,
            username: String,
            email: String,
            phone: String,
            picture: String,
            matches_win: Number,
            country: String,
        },
        questions: [{
            id: Number,
            score: Number,
            title: String,
            is_true: Boolean,
            option_1: String,
            option_2: String,
            option_3: String,
            option_4: String,
            hardness: Number,
            used_times: Number,
            question_answer: Number,
            user_answer: Number,
        }],
    }],
});

module.exports = mongoose.model('Game', Game);
