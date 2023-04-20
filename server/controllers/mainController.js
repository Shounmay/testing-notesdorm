exports.homepage = async (req, res) => {
	const locals = {
		title: 'Notesdorm',
		description: 'Free notes!!!',
	};

	res.render('index', { locals, layout: '../views/layouts/front-page' });
};
