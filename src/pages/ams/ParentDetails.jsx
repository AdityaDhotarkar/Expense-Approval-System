import React, { memo, useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { firestore } from "../../firebase/config";
import { GetUserPrivilages } from "../../firebase/UserPrivilageProvider";

import { useSession } from "../../firebase/UserProvider";


export default memo(function ParentDetails(){
    const {
        register,
        unregister,
        setValue,
        handleSubmit,
        formState: { errors },
      } = useForm();    

      const [fatherOccupation, setFatherOccupation] = useState("service");
      const [motherOccupation, setMotherOccupation] = useState("service");
      const [isSchoolBms, setIsSchoolBms] = useState("bms"); 
      const [isLoading, setisLoading] = useState(false);
      
      const [childFields, setChildFields] = useState([
        {childName:'' , childDob:'' , isSchoolBms:true , otherSchoolName:''}
      ]);

    
      const [fatherDetails, setFatherDetails] = useState({
        fullName: "",
        dob: "",
        qualifications: "",
        occupation: "",
        companyName: "",
        designation: "",
        typeOfBusiness: "",
      });

      const [motherDetails, setMotherDetails] = useState({
        fullName: "",
        dob: "",
        qualifications: "",
        occupation: "",
        companyName: "",
        designation: "",
        typeOfBusiness: "",
      });

      const [inputFields, setInputFields] = useState({
        fatherDetails: {
          fullName: "",
          dob: "",
          qualifications: "",
          occupation: "",
          companyName: "",
          designation: "",
          typeOfBusiness: "",
        },
        motherDetails: {
          fullName: "",
          dob: "",
          qualifications: "",
          occupation: "",
          companyName: "",
          designation: "",
          typeOfBusiness: "",
        },
        childrenDetails: [{childName:'' , childDob:'' , isSchoolBms:true , otherSchoolName:''},],
      });
      

      const {user} = useSession();
      const {privilages} = GetUserPrivilages();
      const params = useParams();

      const handleFatherOccupation= (e) => {
        
        setFatherOccupation(e.target.value);
      };
      const handleMotherOccupation= (e) => {
        
        setMotherOccupation(e.target.value);
      };

      const handleChildFieldsInputChange = (index, event) => {
        const values = [...childFields];
        
        switch (event.target.name) {
          case ("childName"+index) : values[index].childName = event.target.value;
          break;
          case ("childDob"+index) : values[index].childDob = event.target.value;
          break;
          case ("bmsSchool"+index) : values[index].isSchoolBms = true;
          break;
          case ("otherSchool"+index) : values[index].isSchoolBms = false; 
          break;
          case ("otherSchoolName"+index) : values[index].otherSchoolName = event.target.value;
          break;
        }

        setChildFields(values);
        
     
      };

      const handleAddChildFields = () => {
        const values = [...childFields];
        values.push({ childName:'' , childDob:'' , isSchoolBms:'' , otherSchoolName:'' });
        setChildFields(values);
        
      };


      const handleRemoveChildFields = index => {
        const values = [...childFields];
        values.splice(index, 1);
        setChildFields(values);
      };
      
      useEffect(async () => {

        let parentId = "";
        await firestore
          .collection("parents")
          .where("updatedBy", "==", user.email)
          .get({source: "server"})
          .then(async (QuerySnapshot) => {
            QuerySnapshot.forEach((doc) => {
              parentId = doc.id;
            });
          });
        
        if(parentId !== ""){
          
        const docRef = firestore.collection("parents").doc(parentId);
        docRef.onSnapshot((snapshot) => {
          if (snapshot.exists) {  
            const data = snapshot.data();

            setFatherDetails({
              fullName: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.fullName
              : "",
              dob: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.dob
              : "",
              qualifications: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.qualifications
              : "",
              occupation: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.occupation
              : "",
              companyName: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.companyName
              : "",
              designation: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.designation
              : "",
              typeOfBusiness: data.fatherDetails !== "" && data.fatherDetails !== undefined
              ? data.fatherDetails.typeOfBusiness
              : "",
            });
            
            setMotherDetails({
              fullName: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.fullName
              : "",
              dob: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.dob
              : "",
              qualifications: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.qualifications
              : "",
              occupation: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.occupation
              : "",
              companyName: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.companyName
              : "",
              designation: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.designation
              : "",
              typeOfBusiness: data.motherDetails !== "" && data.motherDetails !== undefined
              ? data.motherDetails.typeOfBusiness
              : "",
            });
    
          
          }
        });

        }
 
      
      }, []); 


      //Function for adding the data for the first time 
      const addParentDetails = async (parentData) => {
        setisLoading(true);
        console.log(parentData);
        await firestore
          .collection("parents")
          .where("updatedBy", "==", user.email)
          .get({source: "server"})
          .then(async (QuerySnapshot) => {
            if(QuerySnapshot.empty){
              
              let newDocRef = firestore.collection("parents").doc();
              await newDocRef
                .set({
                  fatherDetails: {
                    fullName: parentData.fatherFullName.toUpperCase(),
                    dob: parentData.fatherDob,
                    qualifications: parentData.fatherQualifications.toUpperCase(),
                    occupation: parentData.fatherCompanyName === "" ? "SELF EMPLOYED" : "SERVICE",
                    companyName: parentData.fatherCompanyName !== " " && parentData.fatherCompanyName !== undefined ?
                          parentData.fatherCompanyName.toUpperCase() : " ",
                    designation: parentData.fatherDesignation !== " " && parentData.fatherDesignation !== undefined ?
                          parentData.fatherDesignation.toUpperCase() : " ",
                    typeOfBusiness: parentData.fatherTypeOfBusiness !== " " && parentData.fatherTypeOfBusiness !== undefined ?
                          parentData.fatherTypeOfBusiness.toUpperCase() : " ",
                  },
                  motherDetails: {
                    fullName: parentData.motherFullName.toUpperCase(),
                    dob: parentData.motherDob,
                    qualifications: parentData.motherQualifications.toUpperCase(),
                    occupation: parentData.motherCompanyName === "" ? "SELF EMPLOYED" : "SERVICE",
                    companyName: parentData.motherCompanyName !== " " && parentData.motherCompanyName !== undefined ?
                          parentData.motherCompanyName.toUpperCase() : " ",
                    designation: parentData.motherDesignation !== " " && parentData.motherDesignation !== undefined ?
                          parentData.motherDesignation.toUpperCase() : " ",
                    typeOfBusiness: parentData.motherTypeOfBusiness !== " " && parentData.motherTypeOfBusiness !== undefined ?
                          parentData.motherTypeOfBusiness.toUpperCase() : " ",
                  },
                  updatedBy: user.email,
                  updatedAt: new Date(),
                  parentId: newDocRef.id,
                })
                .then(() => {
                  
                  alert("The record has been added successfully");
                  setisLoading(false);
                });
            }
            else{

              let docId = "";
              QuerySnapshot.forEach((doc) => {
                docId = doc.id;
              });
              await firestore
                .collection("parents")
                .doc(docId)
                .update({
                  fatherDetails: {
                    fullName: parentData.fatherFullName.toUpperCase(),
                    dob: parentData.fatherDob,
                    qualifications: parentData.fatherQualifications,
                    occupation: parentData.fatherCompanyName === "" ? "SELF EMPLOYED" : "SERVICE",
                    companyName: parentData.fatherCompanyName !== "" && parentData.fatherCompanyName !== undefined ?
                          parentData.fatherCompanyName.toUpperCase() : " ",
                    designation: parentData.fatherDesignation !== "" && parentData.fatherDesignation !== undefined ?
                          parentData.fatherDesignation.toUpperCase() : " ",
                    typeOfBusiness: parentData.fatherTypeOfBusiness !== "" && parentData.fatherTypeOfBusiness !== undefined ?
                          parentData.fatherTypeOfBusiness.toUpperCase() : " ",
                  },
                  motherDetails: {
                    fullName: parentData.motherFullName.toUpperCase(),
                    dob: parentData.motherDob,
                    qualifications: parentData.motherQualifications,
                    occupation: parentData.motherCompanyName === "" ? "SELF EMPLOYED" : "SERVICE",
                    companyName: parentData.motherCompanyName !== "" && parentData.motherCompanyName !== undefined ?
                          parentData.motherCompanyName.toUpperCase() : " ",
                    designation: parentData.motherDesignation !== "" && parentData.motherDesignation !== undefined ?
                          parentData.motherDesignation.toUpperCase() : " ",
                    typeOfBusiness: parentData.motherTypeOfBusiness !== "" && parentData.motherTypeOfBusiness !== undefined ?
                          parentData.motherTypeOfBusiness.toUpperCase() : " ",
                  },

                  updatedAt: new Date(),
                })
                .then(() => {
                  alert("Update successful");
                  setisLoading(false);

                });
            }
          })
             
      };



      return(
        <div style={{ position: "inherit" }}>
          <div className="card p-1 mb-1">
            <div className="justify-content-center d-flex">
              <h2>Parents Details</h2>
            </div>
          </div>

          <div className="card p-1">
            <form  onSubmit = {handleSubmit(addParentDetails)}>
{/* Father's Details Started */}
              <label className="d-flex">
                <h4 className="p-2">Father Details:</h4>    
              </label>
              <div className = "row">
                <div className = "col-md-6">
                  <label className="m-2">
                    Full Name:<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control p-2"
                    id="fatherFullName"
                    name="fatherFullName"
                    {...register("fatherFullName", {
                      required: "Please enter father's name",
                    })}
                  />
                </div>
                <div className="col-md-6">
                <label className="m-2">Date of Birth: <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control p-2"
                  id="fatherDob"
                  name="fatherDob"
                  {...register("fatherDob", {
                    required: "Please enter father's Date of Birth",
                  })}
                />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="m-2">Qualifications:<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control p-2"
                    id="fatherQualifications"
                    name="fatherQualifications"
                    {...register("fatherQualifications", {
                      required:"Please enter father's qualifications",  
                    })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="m-2">Occupation: <span className="text-danger">*</span></label>
                  <br />
                  <div className="row">
                    <div className="col-md-3">
                      <input 
                        type= "radio"

                        id= "fatherService"
                        name= "fatherOccupation"
                        value = "service"
                        onClick = {() => unregister("fatherTypeOfBusiness")}
                        checked={fatherOccupation === "service"}
                        onChange={handleFatherOccupation}
                      />
                      <label htmlFor="fatherService" className="m-2">Service</label>
                    </div>
                    
                    <div className="col-md-6">
                      <input 
                        type= "radio"

                        id= "fatherSelfEmployed"
                        name= "fatherOccupation"
                        value = "selfEmployed"
                        checked={fatherOccupation === "selfEmployed"}
                        onClick = {() => unregister(["fatherCompanyName", "fatherDesignation"])}
                        onChange={handleFatherOccupation}
                      />
                      <label htmlFor="fatherSelfEmployed" className="m-2">Self Employed</label>
                    </div>
                    
                  </div>
                </div>
              </div>
                

              {fatherOccupation === "service" ? (
                <div className="row">
                  <div className="col-md-6">
                    <label>Company Name: <span className="text-danger">*</span></label>
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="fatherCompanyName"
                      name="fatherCompanyName"
                      {...register("fatherCompanyName", {
                        required:"Please enter father's company name",  
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Designation: <span className="text-danger">*</span></label>
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="fatherDesignation"
                      name="fatherDesignation"
                      {...register("fatherDesignation", {
                        required:"Please enter father's designation",  
                      })}
                    />
                  </div>
                </div>
                
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <label>Type of Business: <span className="text-danger">*</span></label>
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="fatherTypeOfBusiness"
                      name="fatherTypeOfBusiness"
                      {...register("fatherTypeOfBusiness", {
                        required:"Please enter father's type of business",  
                      })}
                    />
                    
                  </div>
                  
                </div>

              )}

              <br />
              <br />
              
{/* Father's Details End */}
{/* Mother's Details Started */}
              <label className="d-flex">
                <h4 className="p-2">Mother Details:</h4>
              </label>
              <div className = "row">
                <div className = "col-md-6">
                  <label className="m-2">
                    Full Name:<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control p-2"
                    id="motherFullName"
                    name="motherFullName"
                    {...register("motherFullName", {
                      required: "Please enter mother's name",
                    })}
                  />
                </div>
                <div className="col-md-6">
                <label className="m-2">Date of Birth: <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control p-2"
                  id="motherDob"
                  name="motherDob"
                  {...register("motherDob", {
                    required: "Please enter mother's Date of Birth",
                  })}
                />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="m-2">Qualifications:<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control p-2"
                    id="motherQualifications"
                    name="motherQualifications"
                    {...register("motherQualifications", {
                      required:"Please enter mother's qualifications",  
                    })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="m-2">Occupation: <span className="text-danger">*</span></label>
                  <br />
                  <div className="row">
                    <div className="col-md-3">
                      <input 
                        type= "radio"
                      
                        id= "motherService"
                        name= "motherOccupation"
                        value = "service"
                        onClick = {() => unregister("motherTypeOfBusiness")}
                        checked={motherOccupation === "service"}
                        onChange={handleMotherOccupation}
                      />{" "}
                      <label htmlFor="motherService" className="m-2">Service</label>
                    </div>
                    
                  
                    <div className="col-md-6">
                      <input 
                        type= "radio"

                        id= "motherSelfEmployed"
                        name= "motherOccupation"
                        value = "selfEmployed"
                        onClick={() => unregister(["motherCompanyName", "motherDesignation"])}
                        checked={motherOccupation === "selfEmployed"}
                        onChange={handleMotherOccupation}
                      />{" "}
                      <label htmlFor="motherSelfEmployed" className="m-2">Self Employed</label>
                    </div>
                    
                  </div>
                </div>
              </div>
                

              {motherOccupation === "service" ? (
                <div className="row">
                  <div className="col-md-6">
                    <label>Company Name: <span className="text-danger">*</span></label>
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="motherCompanyName"
                      name="motherCompanyName"
                    
                      {...register("motherCompanyName", {
                        required:"Please enter mother's company name",  
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Designation: <span className="text-danger">*</span></label>
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="motherDesignation"
                      name="motherDesignation"

                      {...register("motherDesignation", {
                        required:"Please enter mother's designation",  
                      })}
                    />
                  </div>
                </div>
                
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <label>Type of Business: <span className="text-danger">*</span></label>
 
                    <input 
                      type="text"
                      className="form-control p-2"
                      id="motherTypeOfBusiness"
                      name="motherTypeOfBusiness"
                      {...register("motherTypeOfBusiness", {
                        required:"Please enter mother's type of business",  
                      })}
                    />
                  </div>
                  
                </div>

              )}
              <br />
              <br />
{/* Mother Details Ended */}
{/* Children Details Started*/}
              
              <label className="d-flex">
                <h4 className="p-2">Children Details:</h4>
              </label>
              
              
              

              
                {childFields.map((childField, index) => (
                  
                    <Fragment key={`${childField}~${index}`}> 
                       <label className="d-flex">
                         <h5 className="p-2">Child  {(index+1)} :</h5>
                       </label>
                       <div className="row">
                         <div className="col-md-6">
                           <label>Name: <span className="text-danger">*</span></label>
                           <input 
                             type = "text"
                             id = {"childName"+index}
                             name = {"childName"+index}
                             className = "form-control p-2"
                             value = {childField.childName}
                             onChange = {event => handleChildFieldsInputChange(index, event)}
                            //  {...register("childName", {
                            //    required:"Please enter the child's name",  
                            //  })}
                           />
                         </div>
                         <div className="col-md-6">
                           <label>Date of Birth: <span className="text-danger">*</span></label>
                           <input 
                             type = "date"
                              id = {`childDob${index}`}
                             name = {"childDob"+index}
                             value = {childField.childDob}
                             className = "form-control p-2"
                            //  {...register("childDob", {
                            //    required:"Please enter the child's date of birth",  
                            //  })}
                             onChange = {event => handleChildFieldsInputChange(index, event)}
                           />
                         </div>
                       </div>   
                       <br />
         
                       <div className="row">
                         <div className="col-md-6">
                           <label className="m-2">School Name: <span className="text-danger">*</span></label>
                           <div className="row">
                             <div className="col-md-6">
                               
                               <input 
                                 type = "radio"
                                
                                 id= {"bmsSchool"+index}
                                 name = {"bmsSchool"+index}
                                 value = {true}
                                 checked={childField.isSchoolBms === true}
                                 onClick = {() => unregister("schoolName")}
                                 onChange = {event => handleChildFieldsInputChange(index, event)}
                               
                                 
                               />
                               <label htmlFor={"bmsSchool"+index} className="m-2">Bhaktivedanta Model School</label>
                             </div>
         
                             <div className="col-md-6">
                               
                               <input 
                                 type = "radio"
                                 
                                 id= {"otherSchool"+index}
                                 name = {"otherSchool"+index}
                                 value = {false}
                                 checked={childField.isSchoolBms === false}
                                 onChange = {event => handleChildFieldsInputChange(index, event)}
                               />
                               <label htmlFor={"otherSchool"+index} className="m-2">Other</label>
                             </div>
                           </div>
                         </div>
         
                         {!!!childField.isSchoolBms ? 
                          ( <div className="col-md-6">
                             <label className="m-2">Please specify School Name<span className="text-danger">*</span></label>
                             <input 
                               type="text"
                               id={"otherSchoolName"+index}
                               name={"otherSchoolName"+index}
                               className="form-control p-2"
                               //value = {childField.otherSchoolName}
                               onChange = {event => handleChildFieldsInputChange(index, event)}
                              //  {...register("otherSchoolName", {
                              //    required:"Please enter the child's school name",  
                              //  })}

                             />
                           </div> )
                           : ""
                         }
         
                       </div>
                       <br />

                      <div className="row mb-3 ">
                        <div className="col justify-content-left d-flex">
                          <button 
                            type="button"  
                            className="btn btn-link text-danger"
                            onClick={() => handleRemoveChildFields(index)}
                          >
                            Delete above child details
                          </button>
                        </div>
                      </div>
                      
                      
                       

                    </Fragment>
                  
         
                ))}

                
              



            
              <div className="row">
                <div className="col justify-content-left d-flex">
                  <button 
                    type="button"  
                    className="btn btn-link"
                    onClick={() => handleAddChildFields()}
                  >
                    Add child
                  </button>
              
                </div>
              </div>
 
              

              <br/>
              <pre>
              {JSON.stringify(childFields, null, 2)}
              {console.log(childFields)}
              </pre>


              <br />
              <br />
              <div className="row mb-3 ">
                <div className="col justify-content-center d-flex">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>{" "}
              
                </div>
              </div>
 
            </form>
          </div>
        </div>

      );

});