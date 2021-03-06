const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// @desc get courses
// @routes GET  /api/v1/courses
// routes GET /api/v1/:bootcampId/courses
// @access PUBLIC

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc get a single course
// @routes GET  /api/v1/courses
// @access PUBLIC

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await (await Course.findById(req.params.id)).populate({
    path: 'Bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`no course with givesn id ${req.params.id} exist`),
      404
    );
  }
  res.status(200).json({ success: true, data: course });
});

// @desc add course
// @routes POST  /api/v1/bootcamps/:bootcampId/courses
// @access Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `no bootcamp with givesn id ${req.params.bootcampId} exist`
      ),
      404
    );
  }

  //make sure user is the owner of the corresponding bootcamp of course
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorize to this add new course to bootcamp with id ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});

// @desc update a course
// @routes PUT  /api/v1/courses/:courseId
// @access Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findByIdAndUpdate(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`no course with givesn id ${req.params.id} exist`),
      404
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorize to this update this course with id ${course._id}`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: course });
});

// @desc delete a course
// @routes DELETE  /api/v1/courses/:courseId
// @access Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`no course with givesn id ${req.params.id} exist`),
      404
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorize to this delete this course with id ${course._id}`,
        401
      )
    );
  }
  course.remove();
  res.status(200).json({ success: true, data: {} });
});
