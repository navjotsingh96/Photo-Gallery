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

  imageData: Image = new Image();
  Uploadallowed = false;
  fileName: string;

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  // Upload image to Storage
  uploadImagestoStorgae(event: any) {
    const file = event.target.files[0];
    const filePath = `uploadedImages/${file.name}`;
    this.fileName = file.name;
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
              this.imageUploadedtoDBSnack();
            }
          });
        })
      )
      .subscribe(url => {
        if (url) {
          this.Uploadallowed = true;
        }
      });
  }

  // Check if erveything is filled
  setInCollection() {
    if (!this.ImageUrl) {
      return
    } if (!this.imageData.name && !this.imageData.image) {
      this.imageData.name = this.fileName;
      this.imageData.image = this.ImageUrl;
      this.UploadDataToCollection()
    }
    else
      this.imageData.image = this.ImageUrl;
    this.UploadDataToCollection()


  }

  // Set image Url from Storage and tag/name in firebase collecion
  UploadDataToCollection() {
    this.firestore
      .collection('images')
      .add(this.imageData.toJSON())
      .then(done => {
        this.openSnackBar();
        this.dialog.closeAll();
      })
  }

  // if user selects image to upload but not want to Upload it deletes image from Storage
  cancelUpload() {
    if (this.ImageUrl) {
      this.storage
        .storage.refFromURL(this.ImageUrl)
        .delete()
      this.dialog.closeAll();
    } else
      this.dialog.closeAll();

  }

  // if data succesfully uploaded to DB
  openSnackBar() {
    this._snackBar.open('Uploaded sucessfully', '', {
      duration: 3000
    });
  }

  // if image succesfully uplaod to Storage
  imageUploadedtoDBSnack() {
    this._snackBar.open('Ready to upload', '', {
      duration: 3000
    });
  }

}
