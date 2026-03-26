import io
import base64
import matplotlib.pyplot as plt
import plotly.io as pio


class Encoder:

    def encode_matplotlib(self, fig=None):
        buffer = io.BytesIO()
        try:
            # 🔥 HANDLE AXES → FIGURE
            if fig is not None and hasattr(fig, "figure"):
                fig = fig.figure

            # 🔥 fallback
            if fig is None:
                fig = plt.gcf()

            # 🔥 FORCE RENDER
            fig.canvas.draw()

            fig.savefig(buffer, format="png", bbox_inches="tight")
            plt.close(fig)

            buffer.seek(0)
            return base64.b64encode(buffer.read()).decode("utf-8")

        except Exception as e:
            print("[DEBUG] Encoding error:", e)
            return None

    def encode_plotly(self, fig):
        buffer = io.BytesIO()
        try:
            buffer.write(pio.to_image(fig, format="png"))
            buffer.seek(0)
            return base64.b64encode(buffer.read()).decode("utf-8")
        except Exception as e:
            print("[DEBUG] Encoding error:", e)
            return None
        
    def encode(self, fig):
        if hasattr(fig, "to_image"):
            print("[DEBUG] Encoding Plotly figure...")
            return self.encode_plotly(fig)
        
        print("[DEBUG] Encoding Matplotlib figure...")
        return self.encode_matplotlib(fig)