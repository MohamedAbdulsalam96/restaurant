import frappe,json


@frappe.whitelist()
def get_orders():
    orders = frappe.db.sql(""" SELECT * FROM `tabOrders` """, as_dict=1)

    for x in orders:
        x['table'] = '<table style="width: 100%;margin-top: 10px;border-bottom: 1px solid lightgray;margin-right: 10px" onclick="select_order({0})">'.format("'" + x.name + "'") + \
                     '<td style="width: 2%;border: 1px solid black;background-color: #00b0ff"></td>' \
                       '<td style="width: 40%;padding-left: 10px">#' + x.name.split("-")[1] + '<br>' + str(
            x.total_amount) + '<br>TABLE: ' + x.table + ' </td>' \
                                                        '<td style="width: 58%">' + str(x.posting_date) + " " + str(
            x.posting_time) + ' <br>' + x.mode_of_payment + ' <br>' + x.status + '</td>' \
                                                                                 '</table>'
        print(x['table'])
    selected_order = ""

    if len(orders) > 0:
        selected_order = get_selected_order(orders[0].name,[],from_get_orders=True)
    return {
        "orders": orders,
        "selected_order":selected_order,
        "dashboard": "change_tab('Dashboard')"
    }


@frappe.whitelist()
def get_selected_order(order_name,e_orders,from_get_orders=False):
    print(e_orders)
    orders = frappe.get_doc("Orders",order_name)
    items_table = ""
    items = frappe.db.sql(""" SELECT * FROM `tabOrder Items` WHERE parent=%s""", order_name, as_dict=1)
    for x in items:
        items_table += '<tr>'
        items_table += '<td style="padding: 15px">' + (x.item_name or "") + '</td>' \
                                                                            '<td style="padding: 15px">' + str(
            x.qty) + '</td>' \
                     ' <td style="padding: 15px">' + (x.notes or "") + '</td>' \
                                                                       ' <td style="padding: 15px">' + (
                       x.status or "") + '</td>' \
                                         ' <td style="padding: 15px">' + str(x.rate) + '</td>'
        items_table += '</tr>'
    selected_order = '<table style="width:100%;">' \
                      '<tr>' \
                      '<td style="padding: 10px" class="text-left">#' + orders.name.split("-")[1] + '</td>' \
                       '<td style="padding: 10px" class="text-right">KIOSK : Kiosk acticve</td>' \
                       '</tr>' \
                       '<tr>' \
                       '<td style="padding: 10px" class="text-left">' \
                       'Date and Time:<br>' + str(orders.posting_date) + " " + str(orders.posting_time) + \
                      '</td>' \
                      '<td style="padding: 10px" class="text-right">' \
                      'Payment Type:<br>' \
                      + orders.mode_of_payment + \
                      '</td>' \
                      '</tr>' \
                      '</table>' \
                      '' \
                      '<table style="width: 98%;margin: 1%">' \
                      ' <tr>' \
                      '<td style="padding: 10px" class="text-left">' \
                      ' Items' \
                      '</td>' \
                      '</tr>' \
                      '<th bgcolor="#d3d3d3" class="text-left" style="padding: 15px;width:20%">Item</th>' \
                      '<th bgcolor="#d3d3d3" class="text-left" style="padding: 15px;width:20%">Quantity</th>' \
                      ' <th bgcolor="#d3d3d3" class="text-left" style="padding: 15px;width:20%">Notes</th>' \
                      ' <th bgcolor="#d3d3d3" class="text-left" style="padding: 15px;width:20%">Status</th>' \
                      ' <th bgcolor="#d3d3d3" class="text-left" style="padding: 15px;width:20%">Price</th>' \
                      '</tr>' + items_table + \
                      '<th bgcolor="#d3d3d3" class="text-left" style="padding: 15px" colspan="4">Total</th>' \
                      '<th bgcolor="#d3d3d3" class="text-left" style="padding: 15px">' + str(orders.total_amount) + '</th>' \
                                  ' </tr>' \
                                  '</table>'

    return selected_order if from_get_orders else {
        "orders": json.loads(e_orders),
        "selected_order":selected_order,
        "dashboard": "change_tab('Dashboard')"
    }

@frappe.whitelist()
def create_order(values):
    data = json.loads(values)
    data['doctype'] = 'Orders'
    data['posting_date'] = frappe.utils.now_datetime().date()
    data['posting_time'] = frappe.utils.now_datetime().time()
    for x in data['order_item']:
        x['item_name'] = frappe.get_doc("Item",x['item']).item_name
        x['status'] = "Preparing"
    frappe.get_doc(data).insert()
    frappe.db.sql(""" UPDATE `tabTable` SET status='Occupied' WHERE name=%s """,data['table'])
    frappe.db.commit()
    return get_orders()