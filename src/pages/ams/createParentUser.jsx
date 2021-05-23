import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { firestore } from "../../firebase/config";
import { useSession } from "../../firebase/UserProvider";



function CreateParentUser() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
 
  const [isLoading, setisLoading] = useState(false);
  const history = useHistory();
  const { user } = useSession();
  //loading the smtpjs email script 

  
   // function to send the email
   const sendmail = async (pass) => {  
         //let username = parentData.emai;
          window.Email.send({
            Host: "smtp.gmail.com",
            Username: "rohan.badwe17@vit.edu",
            Password: "rohbad123@#$",
            To: 'rb.badwe@gmail.com ,rohan.badwe44@gmail.com',
            From: "rohan.badwe17@vit.edu",
            Subject: "dfdfdf",
            Body: pass,
      }).then(
          message => alert("mail send ") )};

  const addParentDetails = async (parentData) => {

    setisLoading(true);
    console.log(parentData);

          await firestore
            .collection("users")
            let newDocRef = firestore.collection("users").doc();
            let nd = newDocRef.path;
            await newDocRef
            .set(
              {
                ams: {
                isAdmissionAdmin: false,
                isManagement: false,
                isParent: true,
                isStaff:false,
                
                },
                dms: {  
                  canAcceptDonation: false,
                  canAccess: false,
                  canCreateDonor: false,
                  canUpdateDonor:false,
                  },
                email: parentData.email.toUpperCase(),
                isAdmin: false,
                language: "English",
                name: parentData.name.toUpperCase(),
                uid: newDocRef,  
                password: nd,              
              })
            .then((docRef) => {
              
              alert("The record has been added successfully");                 
              setisLoading(false);
            // navigate to the home folder 
              sendmail(nd);
              history.push(`home`);
              
            });
    setisLoading(false);
  }; //End of addparentDetails

  // the UI form 
  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card p-1 mb-1">
        <div className="justify-content-center d-flex">
          <h2>Add a New Parent User</h2>
        </div>
      </div>
      <div className="card p-1">
        <form className={formClass} onSubmit={handleSubmit(addParentDetails)}>
          <label className="d-flex">
            <p className="text-danger">Fields marked * are mandatory</p>
          </label>
          <label className="d-flex">
            <h4 className="p-2">Personal Details:</h4>
          </label>
          <div className="row">
            <div className="col-md-6">
              <label className="m-2">
                Parent Name:<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Please enter the parent name here"
                className="form-control ml-2"
                id="name"
                name="name"
                {...register("name", {
                  required: "Please enter parent name",
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
          
          <label className="d-flex">
            <h4 className="p-2">Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Email:</label>
              <input
                placeholder="Please enter email here"
                type="email"
                className="form-control ml-2"
                id="email"
                name="email"
                {...register("email")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Phone:</label>
              <input
                placeholder="Please enter phone number in 3-3-4 format"
                type="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                className="form-control ml-2"
                name="phone"
                {...register("phone")}
              />
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
export default CreateParentUser;



