import { animate, style, transition, trigger } from '@angular/animations';
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { fail } from 'assert';
import { Image } from './models/image.class';
import { UploadComponent } from './upload/upload.component';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('animation', [
      transition('void => visible', [
        style({ transform: 'scale(0.5)' }),
        animate('150ms', style({ transform: 'scale(1)' }))
      ]),
      transition('visible => void', [
        style({ transform: 'scale(1)' }),
        animate('150ms', style({ transform: 'scale(0.5)' }))
      ]),
    ]),
    trigger('animation2', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('50ms', style({ opacity: 0.8 }))
      ])
    ])
  ]
})

export class AppComponent implements OnInit {
  title = 'Photo-Gallery';

  galleryImages = [];

  previewImage = false;
  currentIndex = 0;
  currentImageIndex = this.galleryImages[0];
  totalImageCount = 0;
  controls = false
  search: string;
  showMask = false;
  searchOn: boolean = false;
  loading: boolean = true;
  searchedImages;
  allImages;
  fileUrl;
  notFound: boolean = false;
  data
  constructor(private firestore: AngularFirestore,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.takeImagesFromDB();

  }

  downloadFile(index) {
    this.data = this.allImages[index].image;

    console.log(this.data);

    const blob = new Blob([this.data]);
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  //To download Images from DB
  takeImagesFromDB() {
    this.firestore
      .collection('images')
      .valueChanges()
      .subscribe((data => {
        this.galleryImages = data.sort((img1: any, img2: any) => { // neu nachrichen werden am Ende gezeigt
          return img1.time - img2.time;
        });
        this.allImages = data;
        this.totalImageCount = this.galleryImages.length;
        this.loading = false;

      }))


  }

  // To open Dialog if user want to upload images
  openDialog() {
    this.dialog.open(UploadComponent)
  }

  // Preview Picture on full screen
  onPreviewImage(index: number): void {
    this.showMask = true;
    this.previewImage = true;
    this.currentIndex = index;
    this.currentImageIndex = this.galleryImages[index];
    this.controls = true;


  }

  // if user close Full image view it helps to play end closing Animation
  onAnimationEnd(event: AnimationEvent) {
    if (event) {
      this.showMask = false;
    }
  }

  // on Close buttons will disappear
  onClosePreview() {
    this.previewImage = false;
    this.controls = false;

  }

  // if user click on next button to see next picture
  next(): void {
    this.currentIndex = this.currentIndex + 1;
    if (this.currentIndex > this.galleryImages.length - 1) {
      this.currentIndex = 0;
    }
    this.currentImageIndex = this.galleryImages[this.currentIndex];
  }

  // if user click on back button to see previous picture
  prev(): void {
    this.currentIndex = this.currentIndex - 1;
    if (this.currentIndex < 0) {
      this.currentIndex = this.galleryImages.length - 1;
    }
    this.currentImageIndex = this.galleryImages[this.currentIndex];
  }

  // Search images name through gallery Array
  searchFunction() {
    this.search = this.search.charAt(0).toUpperCase() + this.search.slice(1);
    let searched = this.galleryImages.filter(name => name.name.includes(this.search));
    this.searchedImages = searched;
    if (this.search) {
      this.searchOn = true;
      this.galleryImages = searched;
      this.notFound = false;
    }
    if (!this.search) {
      this.searchOn = false;
      this.galleryImages = this.allImages;
      window.location.reload();

    }
    this.noImageFound();
    this.imageFound();
  }

  imageFound(){
    if (this.galleryImages.length) {
      console.log('Found');
      this.notFound = false;
    }
  }
  noImageFound() {
    if (!this.galleryImages.length) {
      console.log('Not Found');
      this.notFound = true;
    }
  }
}

