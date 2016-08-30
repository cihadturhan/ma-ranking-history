//Define find function which exists in ES6 already
if (!Array.prototype.find) {
    Array.prototype.find = function(f) {
        for (var i = 0; i < this.length; i++) {
            if (f(this[i], i)) {
                return this[i];
            }
        }
        return false;
    };
};


// Convert long strings like Apple style short strings ie "this is th... end"
String.prototype.shortName = function() {
    if (this.length < 24)
        return this;
    return this.substr(0, 18) + '...' + this.substr(-5);
}
