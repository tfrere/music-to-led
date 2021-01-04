import bpy

obj = bpy.context.active_object

if obj.type == 'CURVE':
    for subcurve in obj.data.splines:
        curvetype = subcurve.type
        print('curve type:', curvetype)

        # Display nurbs curve coordinate points in an array
        if curvetype == 'NURBS':
            print("curve is closed:", subcurve.use_cyclic_u)

            for nurbspoint in subcurve.points:
                print([nurbspoint.co[0], nurbspoint.co[1], nurbspoint.co[2]], ',')

        # Display poly curve coordinate points in an array
        if curvetype == 'POLY':
            print("curve is closed:", subcurve.use_cyclic_u)

            for polypoint in subcurve.points:
                print([polypoint.co[0], polypoint.co[1], polypoint.co[2]], ',')

        # Display bezier curve coordinate points in an array
        if curvetype == 'BEZIER':
            print("curve is closed:", subcurve.use_cyclic_u)

            for bezpoint in subcurve.bezier_points:
                print([bezpoint.co[0], bezpoint.co[1], bezpoint.co[2]], ',')
