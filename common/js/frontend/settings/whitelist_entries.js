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

OPTIONS.whitelist_entries = (function () {
    "use strict";

    const escapeRE = (v) => v.replace(/[|\\{}\[\]^$+*?.]/g, "\\$&");

    return Object.freeze({
	ENTRY_TYPE: Object.freeze({
	    REGEXP: 0,
	    EXACT: 1,
	    URL: 2
	}),
	makeEntry (entrySpec) {
	    const that = OPTIONS.whitelist_entries;

	    const ENTRY_FUNC = [
		that.makeRegexp,
		that.makeExact,
		that.makeURL
	    ];

	    const {type, spec} = entrySpec;

	    return ENTRY_FUNC[type](spec);
	},
	makeRegexp (spec) {
	    const {regexp, label} = spec;
	    return Object.freeze({
		getSimple: () => "/" + regexp + "/",
		getDetailed: () => "/" + regexp + "/",
		getType: () => "RegExp",
		getLabel: () => label
	    });
	},
	makeExact (spec) {
	    const {exact, label} = spec;
	    return Object.freeze({
		getSimple: () => exact,
		getDetailed: () => "/^" + escapeRE(exact) + "$/",
		getType: () => "Exact Match",
		getLabel: () => label
	    });
	},
	makeURL (spec) {
	    const {scheme, host, port, path_query_fragment:pqf, label} = spec;

	    const portRepresentation = port === "" ? "" : ":" + port;
	    const hostRepresentation = host.indexOf(":") >= 0 ? "[" + host + "]" : host;
	    const simpleString = scheme + "://" + hostRepresentation + portRepresentation + pqf;

	    return Object.freeze({
		getSimple: () => simpleString,
		getDetailed: () => "/^" + escapeRE(simpleString) + (pqf === "" ? "" : "$") + "/",
		getType: () => "URL",
		getLabel: () => label
	    });
	}
    });
}());
