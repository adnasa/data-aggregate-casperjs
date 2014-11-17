var mdHelper = {
    _self: this,
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
    },
    /**
     * @param {@headline: String, @list: [], @url: String} section
     * @return String
     */
    section: function(section) {
        var sectionString = "";
        if (!section.headline) {
            return sectionString;
        }

        sectionString += _self.headline(section.headline);
        sectionString += _self.list(section.list || []);

        if (section.url) {
            sectionString += "\nUrl" + section.url:
        }

        sectionString += _self.sectionEnd();
        return sectionString;
    }
};

module.exports = mdHelper;
