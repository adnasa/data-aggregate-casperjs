var mdHelper = {
    /**
     * @param String string
     * @return String
     */
    headline: function(string) {
        string = "## " + string + "\n";
        return string;
    },
    /**
     * @param [] list
     * @param bool numeric
     * @return String
     */
    list: function(list, numeric) {
        var length = list.length;
        var string = "";
        for (var i = 1; i <= length; i++) {
            string += "\n" + (numeric ? (i + '. ') : '-') + list[i];
        };
        return string;
    },
    sectionEnd: function() {
        return "\n\n---\n\n";
    }
};

module.exports = mdHelper;
