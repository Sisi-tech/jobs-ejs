const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');

const getAllJobs = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
}

const getJob = async (req, res) => {
    const { user: {userId}, params:{id:jobId} } = req 
    const job = await Job.findOne({
        _id: jobId, createdBy:userId
    })
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`)
    }
    res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
    try {
        req.body.createdBy = req.user.userId;
        const job = await Job.create(req.body);
        res.status(StatusCodes.CREATE).json({ job });
    } catch (error) {
        throw new BadRequestError('Invalid job data');
    }
};

const newJobForm = (req, res) => res.render('job', { job: null });

const updateJob = async (req, res) => {
    const {
        body: {company, position, status},
        user: { userId },
        params: { id: jobId }
    } = req 
    if (!company || !position) {
        throw new BadRequestError('Company and position fields are required');
    }
    const job = await Job.findByIdAndUpdate(
        { _id: jobId, createdBy: userId}, 
        req.body, 
        {new: true, runValidators: true}
    );
    if (!job) {
        throw new NotFoundError(`No job found with id ${jobId}`);
    }
    res.status(StatusCodes.OK).json({ job })
};

const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req 
    const job = await Job.findOneAndRemove({
        _id: jobId,
        createdBy: userId
    })
    if (!job) {
        throw new NotFoundError(`No job found with id ${jobId}`);
    }
    res.status(StatusCodes.OK).send()
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    newJobForm,
    updateJob,
    deleteJob,
}
