
router.get('/', jobsController.getAllJobs);
router.post('/', jobsController.createJob);
router.get('/new', jobsController.newJobForm);
router.post('update/:id', jobsController.updateJob);
router.post('/delete/:id', jobsController.deleteJob);
