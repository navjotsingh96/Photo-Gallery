export class Image {
image!: string;
time!: Date;
name!: string;

constructor(imageJSON?: Image) {
  
    this.name = imageJSON ? imageJSON.name : '';
    this.time = imageJSON ? new Date(imageJSON.time) : new Date();
    this.image = imageJSON ? imageJSON.image : '';
}

    public toJSON() {
        return {
            name: this.name,
            time: this.time.getTime(),
            image: this.image
        }

}
}