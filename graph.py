#! /usr/bin/env python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider, Button, RadioButtons
from collections import namedtuple

Parameters = namedtuple("Parameters", "I N tau gamma lam alpha")

slider_max = Parameters(I=1e3, N=1e6, tau=1, gamma=1, lam=50, alpha=1)
slider_init = Parameters(I=1e3, N=1e6, tau=1, gamma=0, lam=50, alpha=1)
slider_ypos = np.arange(len(slider_max) + 1) * 0.05
t = np.arange(0.0, 1.0, 0.001)


def ydata(I, N, lam, tau, gamma, alpha):
    for _ in t:
        yield I
        I += N * (1 - np.exp(-I * lam * tau / N)) - gamma * I


fig, ax = plt.subplots()
plt.subplots_adjust(left=0.25, bottom=slider_ypos[-1])
s = list(ydata(**{k: v for k, v in slider_init._asdict().items()}))
(l,) = plt.plot(t, s, lw=2)
ax.margins(x=0)
axcolor = "lightgoldenrodyellow"

sliders = Parameters(
    *[
        Slider(
            plt.axes([0.25, ypos, 0.65, 0.03], facecolor=axcolor),
            field,
            0,
            smax,
            valinit=init,
            valstep=smax / 100,
        )
        for field, smax, init, ypos in zip(
            slider_max._fields, slider_max, slider_init, slider_ypos
        )
    ]
)


def update(val):
    l.set_ydata(list(ydata(**{k: v.val for k, v in sliders._asdict().items()})))
    fig.canvas.draw_idle()


for slider in sliders:
    slider.on_changed(update)

resetax = plt.axes([0.8, 0.025, 0.1, 0.04])
button = Button(resetax, "Reset", color=axcolor, hovercolor="0.975")


def reset(event):
    for slider in sliders:
        slider.reset()


button.on_clicked(reset)
plt.show()
