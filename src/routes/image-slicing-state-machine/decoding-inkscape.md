- The Division item in the `Path` menu fires the path-division action ([source](https://gitlab.com/inkscape/inkscape/-/blob/master/share/ui/menus.ui#L997-1002))
- The path-division action does the following ([source](https://gitlab.com/inkscape/inkscape/-/blob/master/src/actions/actions-paths.cpp#L63-69)):
  - gets the current selection
  - runs `removeLPESRecursive` -> `unlinkRecursive` -> `pathCut`
- `removeLPESRecursive` ([source](https://gitlab.com/inkscape/inkscape/-/blob/master/src/selection-chemistry.cpp#L2910)) and `unlinkRecursive` ([source](https://gitlab.com/inkscape/inkscape/-/blob/master/src/selection-chemistry.cpp#L2872)) is used in most path operations, so I'll skip it for now
- I'm having a hard time tracking down `pathCut`

  - [One reference in path-boolop](https://gitlab.com/inkscape/inkscape/-/blob/master/src/path/path-boolop.cpp#L90-95)
    - ➕ references division
    - 👎 doesn't return a new path -> perhaps `path-division` action is mutating the variables and that's desirable?
    - If the above is true, then I need to track down `pathBoolOp` and `bool_op_cut`)
    - `bool_op_cut` is apparently an enum
  - [object-set lists pathCut under "boolean operations"](https://gitlab.com/inkscape/inkscape/-/blob/master/src/object/object-set.h#L481)

- They have a geometry lib [lib2geom](https://gitlab.com/inkscape/lib2geom)
- Docs for their code: https://inkscape.gitlab.io/inkscape/doxygen/

## Other references

- This thread from Steve Ruiz: https://twitter.com/steveruizok/status/1607760459075035136
  - Led me to: https://github.com/jbuckmccready/CavalierContours (web demo here: https://jbuckmccready.github.io/CavalierContoursWebDemo/)
  - Which led me to a cool idea for collage effects in the app: adding colored offsets to images with a dynamic, fast iteration like the one here: https://jbuckmccready.github.io/cavalier_contours_web_demo_page/#/pline_offset
