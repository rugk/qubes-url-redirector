/*
 * Copyright (C) 2017,2018 Raffaele Florio <raffaeleflorio@protonmail.com>
 *
 * This file is part of qubes-url-redirector.
 *
 * qubes-url-redirector is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * qubes-url-redirector is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with qubes-url-redirector.  If not, see <http://www.gnu.org/licenses/>.
 */

OPTIONS.whitelist = Object.freeze({
    submitHandler (ev) {
	"use strict";

	const form = ev.target;

	const entrySpec = {
	    type: Number(form.type.value),
	    spec: null
	};

	/* domain */
	if (entrySpec.type === 2) {
	    entrySpec.spec = {};
	    entrySpec.spec.domain = form.spec.value;
	    entrySpec.spec.subdomain =  form.subdomain.checked;
	} else {
	    entrySpec.spec = form.spec.value;
	}

	const MSG = OPTIONS.messaging.MSG;
	const sendMessage = OPTIONS.messaging.sendMessage;
	sendMessage({msg: MSG.ADD_TO_WHITELIST, options: entrySpec})
	    .then(function (response) {
		const {result, addedEntry} = response;
		if (result) {
		    alert("Entry added successfully");
		    OPTIONS.whitelist.addEntry(addedEntry);
		} else {
		    alert("Unable to add entry!");
		}
	    })
	    .catch((error) => OPTIONS.fatal(error));

	ev.preventDefault();
    },
    render (entries) {
	"use strict";

	const that = OPTIONS.whitelist;
	entries.forEach(that.addEntry);
    },
    addEntry (entry) {
	"use strict";

	const table = document.getElementById("whitelist_entries");

	const row = document.createElement("tr");
	const cells = [];
	for (let i = 0; i < 5; ++i) {
	    cells[i] = document.createElement("td");
	}

	/* String that represent the entry type */
	const typeString = [
	    "RegExp",
	    "Exact Match",
	    "Domain"
	];

	cells[0].textContent = entry.simpleString;
	cells[1].textContent = entry.detailedString;
	cells[2].textContent = typeString[entry.type];
	cells[3].textContent = "Modify Button";

	const MSG = OPTIONS.messaging.MSG;
	const sendMessage = OPTIONS.messaging.sendMessage;

	const rmBtn = document.createElement("button");
	rmBtn.textContent = "Remove";
	rmBtn.addEventListener("click", function (ev) {
	    sendMessage({msg: MSG.RM_FROM_WHITELIST, options: entry.detailedString})
		.then(function (result) {
		    if (result) {
			table.removeChild(row);
			alert("Entry removed successfully!");
		    } else {
			alert("Unable to remove entry!");
		    }
		})
		.catch((error) => OPTIONS.fatal(error));
	});
	cells[4].appendChild(rmBtn);

	row.className = "entry";
	cells.forEach((c) => row.appendChild(c));
	table.appendChild(row);
    }
});

(function () {
    "use strict";

    /*
      called when the selected entry change, in the "type to add " form
    */
    function changeTypeDetails (ev) {
	const checkedType = Number(ev.target.value);

	const typeInfo = [];
	typeInfo[0] = "Remember to escape special RegExp characters with a backslash.";
	typeInfo[1] = "Escaping of special characters is done automatically.";
	typeInfo[2] = typeInfo[1];
	document.getElementById("type_info").textContent = typeInfo[checkedType];

	/* content of the label before the text input */
	const typeLabel = [
	    "JavaScript RegExp: ",
	    "String: ",
	    "Domain: www."
	];
	document.getElementById("type_label").firstChild.textContent = typeLabel[checkedType];
    }

    const entryType = Array.from(document.getElementById("whitelist").type);
    entryType.forEach((e) => e.addEventListener("change", changeTypeDetails));
}());
