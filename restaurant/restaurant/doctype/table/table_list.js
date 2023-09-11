frappe.listview_settings['Table'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["Available"].includes(doc.status)) {
			// Closed
			return [__(doc.status), "green", "status,=," + doc.status];
		} else if (["Occupied"].includes(doc.status)) {
			// Closed
			return [__(doc.status), "red", "status,=,"+ doc.status];
		}

	},
};
