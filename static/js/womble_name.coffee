#---------------------------------------------------------------------------
# Pick a Womble name
#---------------------------------------------------------------------------

class Globe
    constructor: ->
        @block = $('.womble .globe')
        offset = @block.offset()
        @left  = offset.left
        @top   = offset.top
        @diameter  = 181
        @radius    = @diameter / 2
        @numFrames = 150
        @speed     = 60
        @frame     = @numFrames
        @lastDraw  = new Date().getTime()
        @x         = null
        @y         = null
        @slide     = 0
        @maxSlide  = 12
        @block.click(@pickSpot.bind(@))
        speedCtrl = $(".womble .controls .speed")
        speedCtrl[0].value = @speed
        speedCtrl.change (ev) => @speed = ev.target.value
        @geocoder = new google.maps.Geocoder()
        $(".womble .go-again").click(@goAgain.bind(@))

    spinGlobe: ->
        if @speed <= 0
            return
        now = new Date().getTime()
        over = now - @lastDraw
        @lastDraw = now
        delay = 100 - over - @speed
        advFrame = 1
        if delay < -10
            delay += 40
            advFrame = 2
        if delay < 0
            delay = 0
        @frame -= advFrame
        if @frame < 0
            @frame += @numFrames
        offset = @frame * @diameter
        @block.css('background-position', "#{offset}px 0")
        if @x != null
            if ++@slide > @maxSlide
                @x = @y = null
                @slide = 0
        if @slide % 2
            [lat, lng] = @unproject(@x, @y)
            @geocoder.geocode
                'latLng':   lat: lat, lng: lng
                'language': 'en'
               ,
                (results, status) =>
                    name = ""
                    if status == google.maps.GeocoderStatus.OK
                        name = @pickName(results)
                    if name
                        @stopGlobe()
                        @showName(lat, lng, @addTitle(name))
                    else
                        @spinGlobe()
        else
            if delay
                setTimeout (=> requestAnimationFrame(@spinGlobe.bind(@))), delay
            else
                requestAnimationFrame(@spinGlobe.bind(@))

    stopGlobe: ->
        @speed = 0

    pickSpot: (ev) ->
        x =   ev.pageX - @left - @radius
        y = -(ev.pageY - @top  - @radius)
        p = Math.sqrt(x*x + y*y)
        if p <= @radius
            @x = x
            @y = y

    unproject: (x, y) ->
        lng0 = @frame * (Math.PI*2 / @numFrames)
        p = Math.sqrt(x*x + y*y)
        c = Math.asin(p / @radius)
        lat = Math.asin(y*Math.sin(c) / p)
        lng = lng0 + Math.atan2(x*Math.sin(c), p*Math.cos(c))
        if lng > Math.PI
            lng -= Math.PI*2
        radsToDegs = (rads) -> rads * 180 / Math.PI
        [radsToDegs(lat), radsToDegs(lng)]

    pickName: (results) ->
        retval = ""
        validTypes = [
            #"political", "country", "administrative_area_level_1",
            "administrative_area_level_1",
            "administrative_area_level_2", "administrative_area_level_3",
            "administrative_area_level_4", "administrative_area_level_5",
            "colloquial_area", "locality", "ward", "neighborhood",
            "natural_feature", "airport", "park", "point_of_interest", ]
        names = []
        for result in results
            for component in result.address_components
                for type in component.types
                    nm = component.long_name
                    nm = nm.replace(/united states/i, "America")
                    nm = nm.replace(/united kingdom/i, "Britain")
                    nm = nm.replace(/\b(of|the|union|state|county|province|district|region|krai|autonomous|unorganized|republic|state|okrug|oblast|rayon|kray|city|department|governorate)\b/gi, "")
                    nm = nm.replace(/^\w+\ *\((\w+)\)/, "$1")
                    nm = nm.trim()
                    if nm.length > 4 and type in validTypes and nm not in names
                        names.push(nm)
        if names
            retval = names[Math.floor(Math.random() * names.length)]
        return retval

    addTitle: (name) ->
        titles = ["Madame", "Great Uncle", "Cousin", "Aunt", "Great Aunt",
                  "Uncle", "Cousin", "Auntie", "Gramps", "Granny", "Cousin",
                  "Cousin", "Cousin", "Professor", "Cousin", "Uncle"]
        draw = Math.floor(Math.random() * (titles.length + name.length))
        if draw < titles.length
            return "#{titles[draw]} #{name}"
        else
            return name

    showName: (lat, lng, name) ->
        latlng = "#{lat.toFixed(6)}, #{lng.toFixed(6)}"
        $(".womble .latlng").text("#{latlng}")
        $(".womble .latlng").attr('href', "https://maps.google.com/maps"+
                                          "?q=#{latlng}&z=5")
        $('.womble .womble-name').text(name)
        $('.womble .your-name').show()

    goAgain: ->
        @frame = @numFrames
        @x = @y = null
        @slide = 0
        @speed = $(".womble .controls .speed")[0].value
        $('.womble .womble-name').text("")
        $('.womble .your-name').hide()
        $(".womble .latlng").text("")
        $(".womble .latlng").attr('href', "#")
        @spinGlobe()

$ ->
    globe = new Globe
    globe.spinGlobe()
    return

