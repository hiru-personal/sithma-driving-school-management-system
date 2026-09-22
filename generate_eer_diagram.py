#!/usr/bin/env python3
import math
import html

ENTITY_STYLE = "rounded=0;whiteSpace=wrap;html=1;fillColor=#009eb3;strokeColor=none;fontColor=#ffffff;fontStyle=1;fontSize=14;align=center;"
WEAK_ENTITY_STYLE = "shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;fillColor=#009eb3;strokeColor=#ffffff;strokeWidth=2;fontColor=#ffffff;fontStyle=1;fontSize=13;align=center;"

REL_STYLE = "rhombus;whiteSpace=wrap;html=1;fillColor=#003865;strokeColor=none;fontColor=#ffffff;fontStyle=1;fontSize=11;align=center;"
WEAK_REL_STYLE = "shape=rhombus;double=1;whiteSpace=wrap;html=1;fillColor=#003865;strokeColor=#ffffff;strokeWidth=2;fontColor=#ffffff;fontStyle=1;fontSize=11;align=center;"

ATTR_STYLE = "ellipse;whiteSpace=wrap;html=1;fillColor=#990033;strokeColor=none;fontColor=#ffffff;fontSize=10;fontStyle=0;align=center;"
MULTIVAL_ATTR_STYLE = "shape=doubleEllipse;whiteSpace=wrap;html=1;fillColor=#990033;strokeColor=#ffffff;strokeWidth=1.5;fontColor=#ffffff;fontSize=10;fontStyle=0;align=center;"

TRIANGLE_STYLE = "triangle;direction=south;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;strokeWidth=1.5;"
CIRCLE_D_STYLE = "ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;strokeWidth=1;fontSize=11;fontStyle=1;align=center;"

EDGE_ATTR_STYLE = "edgeStyle=straight;html=1;endArrow=none;strokeColor=#666666;strokeWidth=1;"
EDGE_REL_STYLE = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=none;strokeColor=#333333;strokeWidth=1.5;"
EDGE_SPEC_STYLE = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=none;strokeColor=#333333;strokeWidth=1.5;"

class DiagramBuilder:
    def __init__(self):
        self.cells = []
        self.next_id = 100

    def gen_id(self):
        self.next_id += 1
        return f"cell_{self.next_id}"

    def add_entity(self, name, x, y, w=160, h=52, is_weak=False):
        cid = f"ent_{name}"
        style = WEAK_ENTITY_STYLE if is_weak else ENTITY_STYLE
        val = html.escape(name)
        cell = f'<mxCell id="{cid}" value="{val}" style="{style}" vertex="1" parent="1">\n'
        cell += f'  <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />\n</mxCell>'
        self.cells.append(cell)
        return cid, x + w/2, y + h/2, w, h

    def add_attribute(self, attr_name, x, y, parent_ent_id, w=84, h=28, is_pk=False, is_multival=False):
        cid = self.gen_id()
        style = MULTIVAL_ATTR_STYLE if is_multival else ATTR_STYLE
        if is_pk:
            val = f"&lt;u&gt;{html.escape(attr_name)}&lt;/u&gt;"
        else:
            val = html.escape(attr_name)
        cell = f'<mxCell id="{cid}" value="{val}" style="{style}" vertex="1" parent="1">\n'
        cell += f'  <mxGeometry x="{round(x, 1)}" y="{round(y, 1)}" width="{round(w, 1)}" height="{round(h, 1)}" as="geometry" />\n</mxCell>'
        self.cells.append(cell)

        eid = self.gen_id()
        edge = f'<mxCell id="{eid}" style="{EDGE_ATTR_STYLE}" edge="1" parent="1" source="{parent_ent_id}" target="{cid}">\n'
        edge += f'  <mxGeometry relative="1" as="geometry" />\n</mxCell>'
        self.cells.append(edge)
        return cid

    def add_attributes_above(self, ent_id, cx, cy, w, h, attrs, dy1=48, dy2=88, spread=1.2):
        """Places attributes in 1 or 2 rows above the entity in a gentle arch."""
        n = len(attrs)
        if n == 0:
            return
        
        def calc_w(name):
            return max(76, len(name) * 7.2 + 16)

        if n <= 5:
            # Single row
            total_w = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in attrs) + (n - 1) * 12
            start_x = cx - total_w / 2
            curr_x = start_x
            for a in attrs:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                # gentle arch
                offset_ratio = (curr_x + aw/2 - cx) / (total_w/2 + 1)
                arch = abs(offset_ratio) * 10
                ay = cy - h/2 - dy1 - arch
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12
        else:
            # Two rows: split evenly
            mid = (n + 1) // 2
            row2 = attrs[:mid]  # higher row
            row1 = attrs[mid:]  # lower row (closer to entity)

            # Lower row (closer)
            total_w1 = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in row1) + (len(row1) - 1) * 12
            curr_x = cx - total_w1 / 2
            for a in row1:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                ay = cy - h/2 - dy1
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12

            # Upper row (higher)
            total_w2 = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in row2) + (len(row2) - 1) * 12
            curr_x = cx - total_w2 / 2
            for a in row2:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                ay = cy - h/2 - dy2
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12

    def add_attributes_below(self, ent_id, cx, cy, w, h, attrs, dy1=48, dy2=88):
        """Places attributes in 1 or 2 rows below the entity in a gentle arch."""
        n = len(attrs)
        if n == 0:
            return

        def calc_w(name):
            return max(76, len(name) * 7.2 + 16)

        if n <= 5:
            total_w = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in attrs) + (n - 1) * 12
            curr_x = cx - total_w / 2
            for a in attrs:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                ay = cy + h/2 + dy1
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12
        else:
            mid = (n + 1) // 2
            row1 = attrs[:mid]  # closer row
            row2 = attrs[mid:]  # further row

            total_w1 = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in row1) + (len(row1) - 1) * 12
            curr_x = cx - total_w1 / 2
            for a in row1:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                ay = cy + h/2 + dy1
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12

            total_w2 = sum(calc_w(a[0] if isinstance(a, tuple) else a) for a in row2) + (len(row2) - 1) * 12
            curr_x = cx - total_w2 / 2
            for a in row2:
                aname = a[0] if isinstance(a, tuple) else a
                is_pk = a[1] if isinstance(a, tuple) else False
                is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
                aw = calc_w(aname)
                ay = cy + h/2 + dy2
                self.add_attribute(aname, curr_x, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)
                curr_x += aw + 12

    def add_attributes_left(self, ent_id, cx, cy, w, h, attrs, dx=55):
        """Places attributes in a vertical arc to the left."""
        n = len(attrs)
        if n == 0:
            return
        def calc_w(name):
            return max(76, len(name) * 7.2 + 16)
        
        total_h = n * 32
        start_y = cy - total_h / 2
        for i, a in enumerate(attrs):
            aname = a[0] if isinstance(a, tuple) else a
            is_pk = a[1] if isinstance(a, tuple) else False
            is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
            aw = calc_w(aname)
            ay = start_y + i * 34
            # slight curve
            curve = math.sin((i / (n - 1 if n > 1 else 1)) * math.pi) * 20
            ax = cx - w/2 - dx - aw - curve
            self.add_attribute(aname, ax, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)

    def add_attributes_right(self, ent_id, cx, cy, w, h, attrs, dx=55):
        """Places attributes in a vertical arc to the right."""
        n = len(attrs)
        if n == 0:
            return
        def calc_w(name):
            return max(76, len(name) * 7.2 + 16)
        
        total_h = n * 32
        start_y = cy - total_h / 2
        for i, a in enumerate(attrs):
            aname = a[0] if isinstance(a, tuple) else a
            is_pk = a[1] if isinstance(a, tuple) else False
            is_mv = a[2] if isinstance(a, tuple) and len(a) > 2 else False
            aw = calc_w(aname)
            ay = start_y + i * 34
            curve = math.sin((i / (n - 1 if n > 1 else 1)) * math.pi) * 20
            ax = cx + w/2 + dx + curve
            self.add_attribute(aname, ax, ay, ent_id, w=aw, h=28, is_pk=is_pk, is_multival=is_mv)

    def add_relationship(self, rel_name, x, y, w=104, h=54, is_weak=False):
        cid = f"rel_{rel_name}_{self.gen_id()}"
        style = WEAK_REL_STYLE if is_weak else REL_STYLE
        val = html.escape(rel_name)
        cell = f'<mxCell id="{cid}" value="{val}" style="{style}" vertex="1" parent="1">\n'
        cell += f'  <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />\n</mxCell>'
        self.cells.append(cell)
        return cid, x + w/2, y + h/2

    def connect(self, src_id, tgt_id, card=""):
        cid = self.gen_id()
        cell = f'<mxCell id="{cid}" value="{card}" style="{EDGE_REL_STYLE};labelBackgroundColor=none;fontColor=#000000;fontSize=11;fontStyle=1;" edge="1" parent="1" source="{src_id}" target="{tgt_id}">\n'
        cell += f'  <mxGeometry relative="1" as="geometry" />\n</mxCell>'
        self.cells.append(cell)
        return cid

    def add_specialization(self, super_ent_id, super_cx, super_cy, sub_ids, tri_y):
        tri_id = self.gen_id()
        tw, th = 36, 32
        tx = super_cx - tw/2
        ty = tri_y
        
        cell = f'<mxCell id="{tri_id}" value="" style="{TRIANGLE_STYLE}" vertex="1" parent="1">\n'
        cell += f'  <mxGeometry x="{tx}" y="{ty}" width="{tw}" height="{th}" as="geometry" />\n</mxCell>'
        self.cells.append(cell)
        
        cid = self.gen_id()
        cw, ch = 18, 18
        cx = super_cx - cw/2
        cy = ty + th/2 - ch/2 - 2
        cell_c = f'<mxCell id="{cid}" value="d" style="{CIRCLE_D_STYLE}" vertex="1" parent="1">\n'
        cell_c += f'  <mxGeometry x="{cx}" y="{cy}" width="{cw}" height="{ch}" as="geometry" />\n</mxCell>'
        self.cells.append(cell_c)
        
        eid1 = self.gen_id()
        edge1 = f'<mxCell id="{eid1}" style="{EDGE_SPEC_STYLE}" edge="1" parent="1" source="{super_ent_id}" target="{tri_id}">\n'
        edge1 += f'  <mxGeometry relative="1" as="geometry" />\n</mxCell>'
        self.cells.append(edge1)
        
        for sub_id in sub_ids:
            eid = self.gen_id()
            edge = f'<mxCell id="{eid}" style="{EDGE_SPEC_STYLE}" edge="1" parent="1" source="{tri_id}" target="{sub_id}">\n'
            edge += f'  <mxGeometry relative="1" as="geometry" />\n</mxCell>'
            self.cells.append(edge)

    def to_xml(self):
        xml = ['<mxfile host="app.diagrams.net">',
               '  <diagram name="Page-1" id="Sithma-EER-Chen">',
               '    <mxGraphModel dx="3200" dy="2200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="3400" pageHeight="2200" math="0" shadow="0">',
               '      <root>',
               '        <mxCell id="0" />',
               '        <mxCell id="1" parent="0" />']
        xml.extend(self.cells)
        xml.extend(['      </root>',
                    '    </mxGraphModel>',
                    '  </diagram>',
                    '</mxfile>'])
        return "\n".join(xml)

def generate():
    b = DiagramBuilder()

    # =========================================================================
    # 1. SUPERCLASS: USER (Top Center, y=200)
    # =========================================================================
    user_id, u_cx, u_cy, u_w, u_h = b.add_entity("USER", 1600, 210, w=160, h=52)
    b.add_attributes_above(user_id, u_cx, u_cy, u_w, u_h, [
        ("userId", True),
        ("name", False),
        ("email", False),
        ("username", False),
        ("phone", False),
        ("nic", False),
        ("dateOfBirth", False),
        ("role", False),
        ("status", False),
        ("branch", False),
        ("profilePicture", False),
        ("passwordHash", False),
        ("createdAt", False)
    ], dy1=46, dy2=88)

    # Subclasses of USER
    inst_id, in_cx, in_cy, in_w, in_h = b.add_entity("INSTRUCTOR", 700, 440, w=150, h=48)
    b.add_attributes_above(inst_id, in_cx, in_cy, in_w, in_h, [
        ("instructorId", True),
        ("teachingCategories", False),
        ("assignedBranch", False)
    ], dy1=44)

    stud_id, st_cx, st_cy, st_w, st_h = b.add_entity("STUDENT", 1250, 440, w=160, h=52)
    b.add_attributes_left(stud_id, st_cx, st_cy, st_w, st_h, [
        ("studentId", True),
        ("studentType", False),
        ("accountStatus", False),
        ("isAdvancePaid", False),
        ("isPremium", False),
        ("packagePaymentStatus", False),
        ("paymentPlan", False),
        ("lessonsUnlocked", False),
        ("lessonsUsed", False),
        ("medical_date", False),
        ("medicalExamStatus", False),
        ("registration_date", False),
        ("written_exam_date", False),
        ("trial_date", False),
        ("trialEligible", False)
    ], dx=40)

    staff_id, sf_cx, sf_cy, sf_w, sf_h = b.add_entity("STAFF", 1980, 440, w=150, h=48)
    b.add_attributes_above(staff_id, sf_cx, sf_cy, sf_w, sf_h, [
        ("staffId", True),
        ("branch", False),
        ("role", False)
    ], dy1=44)

    admin_id, ad_cx, ad_cy, ad_w, ad_h = b.add_entity("ADMIN", 2580, 440, w=150, h=48)
    b.add_attributes_above(admin_id, ad_cx, ad_cy, ad_w, ad_h, [
        ("adminId", True),
        ("accessLevel", False)
    ], dy1=44)

    # Specialization USER -> (INSTRUCTOR, STUDENT, STAFF, ADMIN)
    b.add_specialization(user_id, u_cx, u_cy, [inst_id, stud_id, staff_id, admin_id], tri_y=320)

    # =========================================================================
    # 2. STUDENT SPECIALIZATION: TYPE1_NEW_LEARNER & TYPE2_TRIAL_READY
    # =========================================================================
    type1_id, t1_cx, t1_cy, t1_w, t1_h = b.add_entity("TYPE1_NEW_LEARNER", 1020, 650, w=170, h=48)
    b.add_attributes_left(type1_id, t1_cx, t1_cy, t1_w, t1_h, [
        ("medicalExamDate", False),
        ("dmtRegistrationDate", False),
        ("learnerExamDate", False),
        ("learnerExamMarks", False),
        ("learnerExamAttempts", False)
    ], dx=35)

    type2_id, t2_cx, t2_cy, t2_w, t2_h = b.add_entity("TYPE2_TRIAL_READY", 1360, 650, w=170, h=48)
    b.add_attributes_right(type2_id, t2_cx, t2_cy, t2_w, t2_h, [
        ("existingPermitNumber", False),
        ("dmtClearanceProof", False),
        ("clearanceVerifiedAt", False)
    ], dx=35)

    # Specialization STUDENT -> (TYPE1, TYPE2)
    b.add_specialization(stud_id, st_cx, st_cy, [type1_id, type2_id], tri_y=540)

    # =========================================================================
    # 3. BRANCH & TIME_SLOT (Left)
    # =========================================================================
    branch_id, br_cx, br_cy, br_w, br_h = b.add_entity("BRANCH", 200, 780, w=150, h=50)
    b.add_attributes_left(branch_id, br_cx, br_cy, br_w, br_h, [
        ("branchId", True),
        ("name", False),
        ("address", False),
        ("contactPhone", False),
        ("dailySessionSlots", False),
        ("sessionDurationMinutes", False)
    ], dx=40)

    ts_id, ts_cx, ts_cy, ts_w, ts_h = b.add_entity("TIME_SLOT", 550, 960, w=150, h=50)
    b.add_attributes_below(ts_id, ts_cx, ts_cy, ts_w, ts_h, [
        ("timeSlotId", True),
        ("date", False),
        ("startTime", False),
        ("endTime", False),
        ("lessonTitle", False),
        ("lessonTopic", False),
        ("vehicleCategory", False),
        ("vehicleType", False),
        ("capacity", False),
        ("bookedCount", False),
        ("status", False)
    ], dy1=46, dy2=88)

    # INSTRUCTOR - conducts -> TIME_SLOT
    rel_cond, _, _ = b.add_relationship("conducts", 680, 680)
    b.connect(inst_id, rel_cond, card="1")
    b.connect(rel_cond, ts_id, card="N")

    # TIME_SLOT - located_at -> BRANCH
    rel_loc, _, _ = b.add_relationship("located_at", 330, 870)
    b.connect(ts_id, rel_loc, card="N")
    b.connect(rel_loc, branch_id, card="1")

    # =========================================================================
    # 4. PACKAGE & BOOKING
    # =========================================================================
    pkg_id, pk_cx, pk_cy, pk_w, pk_h = b.add_entity("PACKAGE", 1750, 740, w=150, h=50)
    b.add_attributes_above(pkg_id, pk_cx, pk_cy, pk_w, pk_h, [
        ("packageId", True),
        ("name", False),
        ("type", False),
        ("categoryGroup", False),
        ("vehicleCategory", False),
        ("lessons", False),
        ("price", False),
        ("isPerLesson", False),
        ("bonusBikeLessons", False),
        ("bonusThreeWheelLessons", False),
        ("isActive", False)
    ], dy1=46, dy2=88)

    # STUDENT - enrolls_in -> PACKAGE
    rel_enr, _, _ = b.add_relationship("enrolls_in", 1580, 560)
    b.connect(stud_id, rel_enr, card="N")
    b.connect(rel_enr, pkg_id, card="1")

    # BOOKING
    bk_id, bk_cx, bk_cy, bk_w, bk_h = b.add_entity("BOOKING", 950, 1060, w=150, h=50)
    b.add_attributes_below(bk_id, bk_cx, bk_cy, bk_w, bk_h, [
        ("bookingId", True),
        ("vehicleType", False),
        ("lessonType", False),
        ("status", False),
        ("cancellationReason", False),
        ("createdAt", False)
    ], dy1=44)

    # STUDENT - places -> BOOKING
    rel_plc, _, _ = b.add_relationship("places", 1120, 880)
    b.connect(stud_id, rel_plc, card="1")
    b.connect(rel_plc, bk_id, card="N")

    # TIME_SLOT - scheduled_for -> BOOKING
    rel_sch, _, _ = b.add_relationship("scheduled_for", 780, 1040, w=110)
    b.connect(ts_id, rel_sch, card="1")
    b.connect(rel_sch, bk_id, card="N")

    # =========================================================================
    # 5. PAYMENT (Center-Right)
    # =========================================================================
    pay_id, py_cx, py_cy, py_w, py_h = b.add_entity("PAYMENT", 2180, 890, w=150, h=50)
    b.add_attributes_right(pay_id, py_cx, py_cy, py_w, py_h, [
        ("paymentId", True),
        ("paymentType", False),
        ("installmentNumber", False),
        ("paymentMethod", False),
        ("paymentStatus", False),
        ("amount", False),
        ("slipImageUrl", False),
        ("transactionReference", False),
        ("uploadedAt", False),
        ("verifiedAt", False)
    ], dx=40)

    # STUDENT - makes -> PAYMENT
    rel_mk, _, _ = b.add_relationship("makes", 1880, 890)
    b.connect(stud_id, rel_mk, card="1")
    b.connect(rel_mk, pay_id, card="N")

    # PACKAGE - paid_towards -> PAYMENT
    rel_pt, _, _ = b.add_relationship("paid_towards", 2020, 790, w=110)
    b.connect(pkg_id, rel_pt, card="1")
    b.connect(rel_pt, pay_id, card="N")

    # STAFF - verifies -> PAYMENT
    rel_vf, _, _ = b.add_relationship("verifies", 2160, 640)
    b.connect(staff_id, rel_vf, card="1")
    b.connect(rel_vf, pay_id, card="N")

    # =========================================================================
    # 6. RESCHEDULE_REQUEST (Center)
    # =========================================================================
    resch_id, rc_cx, rc_cy, rc_w, rc_h = b.add_entity("RESCHEDULE_REQUEST", 1520, 1160, w=180, h=50)
    b.add_attributes_below(resch_id, rc_cx, rc_cy, rc_w, rc_h, [
        ("requestId", True),
        ("milestone_type", False),
        ("reason", False),
        ("preferred_date", False),
        ("previous_date", False),
        ("new_date", False),
        ("status", False),
        ("reviewed_at", False),
        ("review_notes", False)
    ], dy1=46, dy2=88)

    # STUDENT - requests -> RESCHEDULE_REQUEST
    rel_rq, _, _ = b.add_relationship("requests", 1370, 1020)
    b.connect(stud_id, rel_rq, card="1")
    b.connect(rel_rq, resch_id, card="N")

    # STAFF - reviews -> RESCHEDULE_REQUEST
    rel_rv, _, _ = b.add_relationship("reviews", 1770, 1020)
    b.connect(staff_id, rel_rv, card="1")
    b.connect(rel_rv, resch_id, card="N")

    # =========================================================================
    # 7. WEAK ENTITIES: LEARNER_EXAM_ATTEMPT & TRIAL_ATTEMPT
    # =========================================================================
    lea_id, lea_cx, lea_cy, lea_w, lea_h = b.add_entity("LEARNER_EXAM_ATTEMPT", 650, 1420, w=190, h=50, is_weak=True)
    b.add_attributes_below(lea_id, lea_cx, lea_cy, lea_w, lea_h, [
        ("attemptNumber", True),
        ("date", False),
        ("result", False),
        ("marks", False),
        ("notes", False)
    ], dy1=44)

    rel_rec, _, _ = b.add_relationship("records", 890, 1280, is_weak=True)
    b.connect(stud_id, rel_rec, card="1")
    b.connect(rel_rec, lea_id, card="N")

    ta_id, ta_cx, ta_cy, ta_w, ta_h = b.add_entity("TRIAL_ATTEMPT", 1120, 1420, w=160, h=50, is_weak=True)
    b.add_attributes_below(ta_id, ta_cx, ta_cy, ta_w, ta_h, [
        ("attemptNumber", True),
        ("date", False),
        ("result", False),
        ("examinerNotes", False)
    ], dy1=44)

    rel_att, _, _ = b.add_relationship("attempts", 1170, 1260, is_weak=True)
    b.connect(stud_id, rel_att, card="1")
    b.connect(rel_att, ta_id, card="N")

    # =========================================================================
    # 8. QUIZ & EXAM SYSTEM (Bottom Right)
    # =========================================================================
    qa_id, qa_cx, qa_cy, qa_w, qa_h = b.add_entity("QUIZ_ATTEMPT", 1950, 1440, w=160, h=50)
    b.add_attributes_below(qa_id, qa_cx, qa_cy, qa_w, qa_h, [
        ("attemptId", True),
        ("language", False),
        ("vehicleCategory", False),
        ("score", False),
        ("totalQuestions", False),
        ("percentage", False),
        ("passed", False),
        ("createdAt", False)
    ], dy1=46, dy2=88)

    rel_und, _, _ = b.add_relationship("undertakes", 1680, 1320)
    b.connect(stud_id, rel_und, card="1")
    b.connect(rel_und, qa_id, card="N")

    qans_id, qan_cx, qan_cy, qan_w, qan_h = b.add_entity("QUIZ_ANSWER_ITEM", 2420, 1440, w=170, h=50, is_weak=True)
    b.add_attributes_below(qans_id, qan_cx, qan_cy, qan_w, qan_h, [
        ("selectedOption", False),
        ("correctOption", False),
        ("isCorrect", False)
    ], dy1=44)

    rel_cnt, _, _ = b.add_relationship("contains", 2200, 1438, is_weak=True)
    b.connect(qa_id, rel_cnt, card="1")
    b.connect(rel_cnt, qans_id, card="N")

    qq_id, qq_cx, qq_cy, qq_w, qq_h = b.add_entity("QUIZ_QUESTION", 2850, 1440, w=160, h=50)
    b.add_attributes_below(qq_id, qq_cx, qq_cy, qq_w, qq_h, [
        ("questionId", True),
        ("questionText", False),
        ("options", False, True),  # Multivalued
        ("correctAnswerIndex", False),
        ("explanation", False),
        ("language", False),
        ("vehicleCategory", False),
        ("trafficSignImage", False),
        ("isActive", False)
    ], dy1=46, dy2=88)

    rel_ans, _, _ = b.add_relationship("answered_in", 2670, 1438)
    b.connect(qq_id, rel_ans, card="1")
    b.connect(rel_ans, qans_id, card="N")

    # =========================================================================
    # 9. NOTIFICATION (Far Right)
    # =========================================================================
    notif_id, nt_cx, nt_cy, nt_w, nt_h = b.add_entity("NOTIFICATION", 2800, 750, w=160, h=50)
    b.add_attributes_right(notif_id, nt_cx, nt_cy, nt_w, nt_h, [
        ("notificationId", True),
        ("recipientRole", False),
        ("title", False),
        ("message", False),
        ("type", False),
        ("read", False),
        ("link", False),
        ("createdAt", False)
    ], dx=40)

    rel_rec_notif, _, _ = b.add_relationship("receives", 2550, 620)
    b.connect(user_id, rel_rec_notif, card="1")
    b.connect(rel_rec_notif, notif_id, card="N")

    return b.to_xml()

if __name__ == "__main__":
    xml_content = generate()
    with open("/Users/nihindudulavin/Downloads/driving school/Untitled Diagram (1).drawio", "w", encoding="utf-8") as f:
        f.write(xml_content)
    print("Regenerated clean EER Draw.io diagram successfully!")
