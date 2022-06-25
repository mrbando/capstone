/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

 const router = require("express").Router();
 const controller = require("./tables.controller");
 const reservationController = require("../reservations/reservations.controller");

 router
    .route("/")
    .post(controller.create)
    .get(controller.list)
    .all();

router
    .route("/:table_id/seat")
    .put(reservationController.reservationExists, controller.seat)
    .delete(controller.occupy)
    .all();

module.exports = router;