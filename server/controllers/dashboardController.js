const Notes = require('../models/Notes');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
exports.dashboard = async (req, res) => {
	let perPage = 2;
	let page = req.query.page || 1;

	if (page < 0) {
		res.render('404');
		return;
	}

	const locals = {
		title: 'Dashboard',
		description: 'Free NodeJS Notes App.',
	};
	try {
		const notes = await Notes.aggregate([
			{
				$sort: {
					updatedAt: -1,
				},
			},
			{
				$match: {
					user: mongoose.Types.ObjectId(req.user.id),
				},
			},
			{
				$project: {
					title: { $substr: ['$title', 0, 30] },
					body: { $substr: ['$body', 0, 100] },
				},
			},
		])
			.skip(perPage * page - perPage)
			.limit(perPage)
			.exec();

		const count = await Notes.count();
		const total_pages = Math.ceil(count / perPage);

		if (page > total_pages) {
			res.render('404');
		} else {
			res.render('dashboard/index', {
				userName: req.user.firstName,
				locals,
				notes,
				layout: '../views/layouts/dashboard',
				current: page,
				pages: Math.ceil(count / perPage),
			});
		}
	} catch (error) {
		console.log(error);
	}
};

exports.dashboardViewNote = async (req, res) => {
	try {
		const id = req.params.id;
		if (!ObjectId.isValid(id)) {
			res.render('404');
			return;
		}

		if (ObjectId.isValid(id)) {
			if (String(new ObjectId(id)) !== id) {
				res.render('404');
				return;
			}
		}

		const note = await Notes.findById({ _id: req.params.id })
			.where({ user: req.user.id })
			.lean();
		if (note) {
			res.render('dashboard/view-note', {
				noteID: req.params.id,
				note,
				layout: '../views/layouts/dashboard',
			});
		} else {
			res.send('Someting Went Wrong!!!!');
		}
	} catch (error) {
		console.log('Error: ', error);
		if (error instanceof mongoose.Error) {
			console.log(error.errors);
			res.send('Invalid Note ID!!!!');
		}
	}
};

exports.dashboardUpdateNote = async (req, res) => {
	try {
		await Notes.findByIdAndUpdate(
			{
				_id: req.params.id,
			},
			{ title: req.body.title, body: req.body.body, updatedAt: Date.now() }
		).where({ user: req.user.id });
		res.redirect('/dashboard');
	} catch (error) {
		console.log(error);
	}
};

exports.dashboardDeleteNote = async (req, res) => {
	try {
		await Notes.findByIdAndDelete({ _id: req.params.id }).where({
			user: req.user.id,
		});
		res.redirect('/dashboard');
	} catch (error) {
		console.log(error);
	}
};

exports.dashboardAddNote = async (req, res) => {
	res.render('dashboard/add', {
		layout: '../views/layouts/dashboard',
	});
};

exports.dashboardAddNoteSubmit = async (req, res) => {
	try {
		req.body.user = req.user.id;
		await Notes.create(req.body);
		res.redirect('/dashboard');
	} catch (error) {
		console.log(error);
	}
};

exports.dashboardSearchSubmit = async (req, res) => {
	try {
		let searchTerm = req.query.searchTerm;
		const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '');
		const searchResults = await Notes.find({
			$or: [
				{ title: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
				{ body: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
			],
		}).where({ user: req.user.id });

		res.render('dashboard/search', {
			searchResults,
			layout: '../views/layouts/dashboard',
		});
	} catch (error) {
		console.log(error);
	}
};
