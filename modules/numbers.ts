export class Numbers {
    isNumber(value) {
        return !isNaN(Number(value));
    }

    Number(value) {
        return this.isNumber(value);
    }

    Int(value) {
        if (this.isNumber(value)) {
            if (value.toString().includes('.')) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    Double(value) {
        if (this.isNumber(value)) {
            if (value.toString().includes('.')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    Positive(value) {
        if (this.isNumber(value)) {
            if (value.toString().includes('-')) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    Negative(value) {
        if (this.isNumber(value)) {
            if (value.toString().includes('-')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}