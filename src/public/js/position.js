function Position(id) {
    this.id = id;

    this.color = null;
    this.setColor = (color) => this.color = color;
    this.isTaken = () => !!this.color;
}