<<<<<<< HEAD
function Position(id) {
    
=======
export default function Position(id) {
>>>>>>> e041e36f58ae4baae1bf338cef251075d83a46aa
    this.id = id;

    this.color = null;
    this.setColor = (color) => this.color = color;
    this.isTaken = () => !!this.color;
}