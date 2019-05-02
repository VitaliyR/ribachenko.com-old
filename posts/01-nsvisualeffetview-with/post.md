With a release of OS X Yosemite Apple introduced few new components in their SDK, one of them is called **NSVisualEffectView**, which brings opportunity to 
create semitransparent backgrounds for components.

It's a container, so you need to move everything inside it, choose a theme *(light/dark)* and that's it. The one most disturbing issue, that you can't 
change background blur level - it's hardcoded somewhere deeply inside SDK and there is no even getter for it.

A weird thing that I, as usually, tried to google for it, but I've found nothing. So, I decided to create own bicycle-solution:

```swift line-numbers
class SemiTransparentView: NSView {
    
    var alphaLevel: Double = 0.12
    
    override var allowsVibrancy: Bool { return true }
    
    override func drawRect(dirtyRect: NSRect) {
        NSColor(deviceWhite: 255, alpha: CGFloat(alphaLevel)).set()
        NSRectFill(dirtyRect)
    }
    
}
```

You can create a **Custom View** container with this class and put everything inside. The idea that I'm drawing a rectangle on top of this view 
with `alphaLevel`. It works for tables too, but you need to subclass `NSTableView && NSTableRowView`.

I tried to make `alphaLevel` be designable by using *@IBInspectable* but somewhy it doesn't work for me. It seems some bug in XCode, but it is 
fine - I really don't know how guys are live with it - it full of bugs and crashing few times per day.
