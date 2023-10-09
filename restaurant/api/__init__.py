import frappe,json

@frappe.whitelist(allow_guest=1)
def add_order():
    try:
        data = json.loads(frappe.request.data)
        print(data)
        print(data['items'])
        obj = {
            "doctype": "Orders",
            "table":data['table'],
            "posting_date":frappe.utils.now_datetime().date(),
            "posting_time":frappe.utils.now_datetime().time(),
            "mode_of_payment":"Cash",
        }
        for x in data['items']:
            print(x)
            x['item'] = x.get("id")
            x['rate'] = x.get("price")
            x['amount'] = x.get("price") * x.get("qty")
            x['status'] = "Preparing"
        obj['order_item'] = data['items']
        print(obj)
        frappe.get_doc(obj).insert(ignore_permissions=1)
        frappe.db.sql(""" UPDATE `tabTable` SET status='Occupied' WHERE name=%s """, data['table'])
        frappe.db.commit()
        return "Success"
    except:
        print(frappe.get_traceback())

@frappe.whitelist(allow_guest=1)
def get_items():

    item_groups = frappe.db.sql(""" SELECT * FROm `tabItem Group` WHERE show_in_menu=1 """,as_dict=1)

    f_item_groups = [x.name for x in item_groups]

    if len(f_item_groups) == 0:
        return []
    condition = ""

    if len(f_item_groups) == 1:
        condition += " and item_group='{0}' ".format(f_item_groups[0])
    elif len(f_item_groups) > 1:
        condition += " and item_group in {0} ".format(tuple(f_item_groups))

    items = frappe.db.sql(""" SELECT name as id, item_name,item_category as category,image FROM `tabItem` WHERE disabled=0 {0} """.format(condition),as_dict=1)
    for x in items:
        x['price'] = get_rate(x.name)
        if not x.category:
            x.category = ""
    return items
@frappe.whitelist()
def get_rate(item_code):

    condition = " and selling = 1 and price_list='{0}'".format('Standard Selling')

    query = """ SELECT * FROM `tabItem Price` WHERE item_code=%s {0} ORDER BY valid_from DESC LIMIT 1""".format(
        condition)

    item_price = frappe.db.sql(query, item_code, as_dict=1)
    rate = item_price[0].price_list_rate if len(item_price) > 0 else 0
    return rate
