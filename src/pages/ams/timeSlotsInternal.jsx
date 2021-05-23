import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { firestore } from "../../firebase/config";
import { useSession } from "../../firebase/UserProvider";

import * as AiReactIcon from "react-icons/ai";


function CreateTimeSlots() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();




  const handleCollectedByOptions = (e) => {

    setTypePreference(e.target.value);
    
    
  }; 
  const [isLoading, setisLoading] = useState(false);
  const [appointmenttype, setTypePreference] = useState("teacher");
  const status =false;
  const history = useHistory();
  const { user } = useSession();
  //loading the smtpjs email script 
 // const type = "teacher";
  const donorRefOption  = (value) => { };
  const checkDate = (value) => {
    //If date value is in the past then return false else true.
    // time value should be between ->

    let dValue = new Date(value);
    let eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18); //Get date 18 years ago

    if (dValue.getTime() <= eighteenYearsAgo.getTime()) {
      return true;
    } else {
      return false;
    }
  };
  const getInitialState = (checked) => {
    return {checked: true}
    };

  const handleCheck = (checked) => {
   
    this.setState({checked: !getInitialState});

  };


  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card p-1 mb-1">
        <div className="justify-content-center d-flex">
          <h2>Create a new time slot </h2>
        </div>
      </div>
      <div className="card p-1">
        <form className={formClass} onSubmit={handleSubmit(CreateTimeSlots)}>
          <label className="d-flex">
            <p className="text-danger">Fields marked * are mandatory</p>
          </label>
          <label className="d-flex">
            <h4 className="p-2">create meeting slots :</h4>
          </label>
          <div className="row">
            <div className="col-md-6">
              <label className="m-2">
                Staff Name:<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Please enter the teacher/management name here"
                className="form-control ml-2"
                id="name"
                name="name"
                {...register("name", {
                  required: "Please enter teacher/management name",
                  minLength: {
                    value: 3,
                    message: "Please enter at least 3 characters for name",
                  },
                })}
              />
              {errors.name?.message && (
                <p className="text-danger">{errors.name?.message}</p>
              )}
            </div>
            
          </div>
          
          
          <div className="row mb-3">
            
          
            <div className="col-md-6">
              <label className="m-2">
                Slot Date:<span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control ml-2"
                name="datetime"
                {...register("date", {
                  required: "Please enter date and time of the slot ",
                  validate: { validDate: (value) => checkDate(value) },
                })}
              />
              {errors.dob?.message && (
                <p className="text-danger">{errors.dob?.message}</p>
              )}
              {errors.dob?.type === "validDate" && (
                <p className="text-danger">
                  The date selected should not be in the past or today.
                </p>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="m-2">
                Type of appointment:<span className="text-danger">*</span>
              </label>
              <br />
              <input
                type="radio"
                id="typeTeacher"
                name="collectedBy"
                value="teacher"
                checked={donorRefOption === "teacher"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="typeTeacher">teacher</label>
              <br />
              <input
                type="radio"
                id="typeManagement"
                name="collectedBy"
                value="management"
                checked={donorRefOption === "management"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="typeManagement">Management</label>
            </div>

          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">
                Status:<span className="text-danger">*</span>
              </label>
              <br />
              <input
                type="radio"
                id="typeTeacher"
                name="collectedBy"
                value="teacher"
                checked={donorRefOption === "teacher"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="typeTeacher">vacant</label>
              <br />
              <input
                type="radio"
                id="typeManagement"
                name="collectedBy"
                value="management"
                checked={donorRefOption === "management"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="typeManagement">booked</label>
            </div>

          </div>
          <div className="row mb-6 ">
            <div className="col justify-content-center d-flex">
            <label className="m-2">
                grade/standard:<span className="text-danger">*</span>
              </label>
            <select id = "dropdown">
              <option value="N/A">N/A</option>
              <option value="1">1</option>
               <option value="2">2</option>
             <option value="3">3</option>
             <option value="4">4</option>
           </select>
           <label htmlFor="dropdown">select child grade </label>

            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={(e) => {
                  this.context.history.push('/home');
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          

        </form>
      </div>
    </div>
  );}        
export default CreateTimeSlots;