
//file imports
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";

function newRes() {

const template = {
    status: "",
    first_name: "",
    last_name: "",
    mobile_number: "",
    people: 0,
    reservation_date: "",
    reservation_time: "",
  };

//states & history
const [form, setForm] = useState({...template});
const [error, setError] = useState(false);
const history = useHistory();

//abort
const abortController = new AbortController();

function handleChange({ target }) {
    const { name, value } = target; 
    setForm({...form, [name]: value})
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setShowError(false);
    const newRes = {
      first_name: form.first_name,
      last_name: form.last_name,
      mobile_number: form.mobile_number,
      people: Number(form.people),
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
    };







}




}