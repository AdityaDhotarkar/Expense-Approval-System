import { firestore, storage } from "../../firebase/config";

export const updateUserDocument = async (expenses) => {
    const docRef = firestore.collection('expenses').doc(`/expenses/${expenses.expenseNo}`);
    return docRef.update(expenses);
  };
  
  export const uploadImage = (userId, file, progress) => {
    return new Promise((resolve, reject) => {
      // create file reference
      const filePath = `expenses/${userId}/` + file.name;
      const fileRef = storage.ref().child(filePath);
  
      // upload task
      const uploadTask = fileRef.put(file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => progress(snapshot),
        (error) => reject(error),
        () => {
          resolve(uploadTask.snapshot.ref);
        }
      );
    });
  };
  
  export const getDownloadUrl = (userId) => {
    const filePath = `expenses/${userId}/`;
    return storage.ref().child(filePath).getDownloadURL();
  };
  