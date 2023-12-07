var page = ""
var orders = []
frappe.pages['restaurant'].on_page_load = function (wrapper) {
    page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Restaurant',
        single_column: false
    });
    var advance_type = page.add_field({
        label: 'Order From',
        fieldtype: 'Select',
        fieldname: 'advance_type',
        options: ['', 'All', 'Table', 'Kiosk'],
        change() {

        }
    })
    var advance_type = page.add_field({
        label: 'Type',
        fieldtype: 'Select',
        fieldname: 'type',
        options: ['', 'Pay Waiter', 'Pay Counter', 'Pay POS', 'KNET'],
        change() {

        }
    })
    var advance_type = page.add_field({
        label: 'Order Number',
        fieldtype: 'Data',
        fieldname: 'order_number',
        change() {

        }
    })
    let $btn = page.set_primary_action('Create Order', () => create_order()
    )
    page.set_secondary_action('Refresh', () => fetch_data())

    fetch_data()
}

function fetch_data() {
    frappe.call({
        method: "restaurant.restaurant.page.restaurant.restaurant.get_orders",
        args: {},
        freeze: true,
        freeze_message: "Fetching Orders...",
        async: false,
        callback: function (resp) {
            orders = resp.message.orders
            resp.message['url'] =  "https://adminstaging.cocodine.me"
          if(page.sidebar[0].children.length > 0){
				cur_page.page.page.sidebar[0].replaceChild(document.createTextNode(""),cur_page.page.page.sidebar[0].children[0])
                page.sidebar.append(frappe.render_template("test", {'doc': resp.message}))
			} else {
                page.sidebar.append(frappe.render_template("test", {'doc': resp.message}))

			}

            if(page.main[0].children.length > 1){
				cur_page.page.page.main[0].replaceChild(document.createTextNode(""),cur_page.page.page.main[0].children[cur_page.page.page.main[0].children.length - 1])
                page.main.append(frappe.render_template("main", {'doc': resp.message}))
			} else {
                page.main.append(frappe.render_template("main", {'doc': resp.message}))

			}

        }
    });
    document.getElementById("navbar-search").style.display = "none"
    document.getElementsByClassName("navbar-nav")[1].style.display = "none"
    document.getElementsByClassName("search-icon")[0].style.display = "none"
    document.getElementsByClassName("page-head")[0].style.backgroundColor = "#C5CE92"
    document.getElementById("page-restaurant").style.backgroundColor = "#C5CE92"
}

function select_order(order) {
    frappe.call({
        method: "restaurant.restaurant.page.restaurant.restaurant.get_selected_order",
        args: {
            order_name: order,
            e_orders: orders
        },
        freeze: true,
        freeze_message: "Fetching Orders...",
        async: false,
        callback: function (resp) {

            orders = resp.message.orders
            resp.message['url'] =  "https://adminstaging.cocodine.me"
            if (page.main[0].children.length > 1) {

                console.log(page.main[0].children)
                cur_page.page.page.main[0].replaceChild(document.createTextNode(""),cur_page.page.page.main[0].children[cur_page.page.page.main[0].children.length - 1])
                page.sidebar[0].replaceChild(document.createTextNode(""), page.sidebar[0].children[0])

                page.sidebar.append(frappe.render_template("test", {'doc': resp.message}))
                page.main.append(frappe.render_template("main", {'doc': resp.message}))

            } else {

                page.sidebar.append(frappe.render_template("test", {'doc': resp.message}))
                cur_page.page.page.main[0].replaceChild(document.createTextNode(""),cur_page.page.page.main[0].children[cur_page.page.page.main[0].children.length - 1])

            }


        }
    });
}

function create_order() {
    var table_fields = [
        {
            fieldname: "item", fieldtype: "Link", options: "Item",
            in_list_view: 1, label: "Item"
        },
        {
            fieldname: "qty", fieldtype: "Float",
            in_list_view: 1, label: "Qty"
        },
        {
            fieldname: "rate", fieldtype: "Currency",
            in_list_view: 1, label: "Price",
        },
        {
            fieldname: "notes", fieldtype: "Small Text",
            in_list_view: 1, label: "Notes"
        }
    ];
    let d = new frappe.ui.Dialog({
        title: 'Enter details',
        fields: [
            {
                fieldname: "table", fieldtype: "Link", options: "Table",reqd:1,
                in_list_view: 1, label: "Table",
                get_query: function () {
                    return {
                        filters: {
                            status: "Available",
                            disabled: 0
                        }
                    }
                }
            },
            {
                fieldname: "mode_of_payment", fieldtype: "Link", options: "Mode of Payment",
                in_list_view: 1, label: "Payment Type"
            },

            {
                fieldname: "order_item",
                fieldtype: "Table",
                label: "Items",
                read_only: 1,
                cannot_add_rows: false,
                in_place_edit: false,
                data: [],
                fields: table_fields
            }
        ],
        size: 'small', // small, large, extra-large
        primary_action_label: 'Submit',
        primary_action(values) {
            frappe.call({
                method: "restaurant.restaurant.page.restaurant.restaurant.create_order",
                args: {
                    values:values
                },
                freeze: true,
                freeze_message: "Fetching Orders...",
                async: false,
                callback: function (resp) {
                    orders = resp.message.orders
                    resp.message['url'] =  "https://adminstaging.cocodine.me"
                    fetch_data()
                    d.hide()

                }
            });
        }
    });
    d.show();
    console.log("HERE")
    setTimeout(()=>{
        document.getElementsByClassName("modal-content")[document.getElementsByClassName("modal-content").length-1].style.width = "700px"
    },150)

}

function change_tab(tab) {
    console.log("============")
    console.log(tab)
}

function void_order(name) {
    frappe.confirm('Are you sure you want to proceed?',
    () => {
        frappe.call({
            method: "restaurant.restaurant.page.restaurant.restaurant.void_order",
            args: {
                order_name: name,
            },
            freeze: true,
        freeze_message:"Voiding order.....",
        callback: function () {
             fetch_data()
        }
        })
    }, () => {
        // action to perform if No is selected
    })
}
function paid_order(name) {
    frappe.confirm('Are you sure you want to proceed?',
    () => {
        frappe.call({
            method: "restaurant.restaurant.page.restaurant.restaurant.paid_order",
            args: {
                order_name: name,
            },
            freeze: true,
        freeze_message:"Paid order.....",
        callback: function () {
             fetch_data()
        }
        })
    }, () => {
        // action to perform if No is selected
    })
}