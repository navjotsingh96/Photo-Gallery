import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { Image } from '../models/image.class';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  nameFormControl = new FormControl('', [Validators.required]);

  downloadURL: any;
  ImageUrl: any;

  imageData: Image= new Image();
  Uploadallowed = false;

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }
  
  uploadImagestoStorgae(event: any) {
    const file = event.target.files[0];
    const filePath = `uploadedImages/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe((url: any) => {
            if (url) {
              this.ImageUrl = url;
            }
          });
        })
      )
      .subscribe(url => {
        if (url) {
          console.log(url);
          this.imageUploadedtoDBSnack();
        }
      });
  }

  setInCollection() {
    if (!this.imageData.name && !this.imageData.image) {
      return
    } else
    this.imageData.image = this.ImageUrl;
    this.firestore
      .collection('images')
      .add(this.imageData.toJSON())
      .then(done => {
        this.openSnackBar();
        this.dialog.closeAll();


      })
  }
  openSnackBar() {
    this._snackBar.open('Uploaded sucessfully', '', {
      duration: 3000
    });
  }
  imageUploadedtoDBSnack(){
    this._snackBar.open('Ready to upload', '', {
      duration: 3000
    });
  }

}
