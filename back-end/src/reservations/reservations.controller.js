const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Has valid fields handler for reservation resources
 */
function hasValidFields(req, res, next) {
  const { data = {}} = req.body;
  const validFields = new Set([
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
    "status",
    "created_at",
    "updated_at",
    "reservation_id"
  ]);

  const invalidFields = Object.keys(data).filter(field => !invalidFields.has(field));
  invalidFields 
    ? next({
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      })
    : next();
}

function hasReservationId(req, res, next) {
  const reservation = req.params.reservation_id || req.body?.data?.reservation_id;
  if(reservation){
      res.locals.reservation_id = reservation;
      next();
  } else {
      next({
          status: 400,
          message: `missing reservation_id`,
      });
  }
}


function hasReservationIdForTable(req, res, next) {
  const reservation = req.params.reservation_id || req.params.table_id || req.body?.data?.reservation_id;
  if(reservation){
      res.locals.reservation_id = reservation;
      next();
  } else {
      next({
          status: 400,
          message: `missing reservation_id`,
      });
  }
}


/**
 * Reservation Exists handler for reservation resources
 */
async function reservationExists(req, res, next) {
  const reservation_id = res.locals.reservation_id;
  const reservation = await service.read(reservation_id);
  
  if(reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
      next({
        status: 404,
        message: `Reservation doesn't exist: ${reservation}`,
      })
  }
}


/**
 * Body data has fields handler for reservation resources
 */
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {}} = req.body;
    data[propertyName] 
      ? next()
      : next({
          status: 400,
          message: `Must include a ${propertyName}}`,
        })
  }
}


/**
 * Valid Date handler for reservation resources
 */
function isValidDate(req, res, next){
  const { data = {} } = req.body;
  const reservation_date = new Date(data['reservation_date']);
  const day = reservation_date.getUTCDay();

  if (isNaN(Date.parse(data['reservation_date']))){
      return next({ status: 400, message: `Invalid reservation_date` });
  }
  if (day === 2) {
      return next({ status: 400, message: `Restaurant is closed on Tuesdays` });
  }
  if (reservation_date < new Date()) {
      return next({ status: 400, message: `Reservation must be set in the future` });
  }
  next();
}

/**
 * Valid Time handler for reservation resources
 */
function isValidTime(req, res, next){
  const { data = {} } = req.body;
  // TODO: Change this...
  if (
      /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(data['reservation_time']) || 
      /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(data['reservation_time']
    ) ){
    return next();
  }
  next({ status: 400, message: `Invalid reservation_time` });
}

/**
 * Valid Number handler for reservation resources
 */
function isValidNumber(req, res, next){
  const { data = {} } = req.body;
  if (data['people'] === 0 || !Number.isInteger(data['people'])){
      return next({ status: 400, message: `Invalid number of people` });
  }
  next();
}

/**
 * Check Status handler for reservation resources
 */
function checkStatus(req, res, next){
  const { data = {} } = req.body;
  if (data['status'] === 'seated' || data['status'] === 'finished'){
      return next({ status: 400, message: `status is ${data['status']}` });
  }
  next();
}

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const mobile_number = req.query.mobile_number;
  const data  = await (
      mobile_number
    ? service.search(mobile_number)
    : service.list(req.query.date)
  )
  res.json({
    data,
  });
}


/**
 * Create handler for reservation resources
 */
async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data: data });
}

/**
 * Read handler for reservation resources
 */
async function read(req, res) {
  const data = res.locals.reservation;
  res.status(200).json({ data });
}

/**
 * Status handler for reservation resources
 */
async function status(req, res) {
  res.locals.reservation.status = req.body.data.status;
  const data = await service.status(res.locals.reservation);
  res.json({ data });
}

/**
 * Status handler for reservation resources
 */
async function unfinishedStatus(req, res) {
  if ("booked" !== res.locals.reservation.status) {
    next({
      status: 400,
      message: `Reservation status: '${res.locals.reservation.status}'.`,
    });
  } else {
      next();
  }
}
 
/**
 * Update handler for reservation resources
 */
async function update(req, res) {
  const { reservation_id } = res.locals.reservation;
  req.body.data.reservation_id = reservation_id;
  const data = await service.status(req.body.data);
  res.json({ data });
}

// Checks if body data appears
const has_first_name = bodyDataHas("first_name");
const has_last_name = bodyDataHas("last_name");
const has_mobile_number = bodyDataHas("mobile_number");
const has_reservation_date = bodyDataHas("reservation_date");
const has_reservation_time = bodyDataHas("reservation_time");
const has_people = bodyDataHas("people");
// Table Validation 
// #TODO:
const has_status = bodyDataHas("status");
const has_capacity = bodyDataHas("capacity");
const has_table_name = bodyDataHas("table_name");
const has_reservation_id = bodyDataHas("reservation_id");

module.exports = {
  create: [
    hasValidFields,
    has_first_name,
    has_last_name,
    has_mobile_number,
    has_reservation_date,
    has_reservation_time,
    has_people,
    isValidDate,
    isValidTime,
    isValidNumber, 
    checkStatus,
    asyncErrorBoundary(create)
  ],
  read: [
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(read)
  ],
  list: [asyncErrorBoundary(list)],
  reservationExists: [
    hasReservationId,
    reservationExists,
  ],
  status: [
    hasReservationId,
    reservationExists,
    unfinishedStatus,
    asyncErrorBoundary(status)
  ],
  update: [
    hasValidFields,
    has_first_name,
    has_last_name,
    has_mobile_number,
    has_reservation_date,
    has_reservation_time,
    has_people,
    isValidDate,
    isValidTime,
    isValidNumber, 
    checkStatus,
    hasReservationId,
    reservationExists,
    asyncErrorBoundary(update)
  ]
};