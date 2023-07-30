// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class PostsService {

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private toastr: ToastrService,
    private router: Router
  ) {}

  uploadImage(selectedImage, postData,formStatus,id) {
    const filePath = `postIMG/ ${Date.now()}`;
    console.log(filePath);

    this.storage.upload(filePath, selectedImage).then(() => {
      console.log('post image uploaded successfully');
      this.storage.ref(filePath).getDownloadURL().subscribe((URL) => {
          postData.postImgPath = URL;
          console.log(postData);

          this.saveData(postData);
        });
    });
  }

  saveData(postData) {
    this.afs.collection('posts').add(postData).then((docRef) => {
        this.toastr.success('data insert successfully');
        this.router.navigate(['/posts']);
      });
  }

  loadData(): Observable<Object> {
    return this.afs.collection('posts').snapshotChanges().pipe(map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, data };
          });
        })
      );
  }

  loadOneData(id) {
    return this.afs.doc(`posts/ ${id}`).valueChanges();
  }

  updateData(id,postData){
    this.afs.doc(`posts/${id}`).update(postData).then(()=>{
      this.toastr.success('Data Update Successfuly');
      this.router.navigate(['/posts']);
    })
  } 

  deleteImage(postImgPath, id){
    this.storage.storage.refFromURL(postImgPath).delete().then(()=>{
      this.deleteData(id);
    })
  }

  deleteData(id){
    this.afs.doc(`posts/${id}`).delete().then(()=>{
      this.toastr.warning('Data Deletes...!');
    })
  }

  markFeatured(id,featuredData){
    this.afs.doc(`posts/${id}`).update(featuredData).then(()=>{
      this.toastr.info('Featured Status Update');
    })
  }

  
}