package com.journeyapps.barcodescanner;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.View;
import com.google.zxing.ResultPoint;
import com.google.zxing.client.android.R;
import com.journeyapps.barcodescanner.CameraPreview;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: loaded from: classes11.dex */
public class ViewfinderView extends View {
    protected static final long ANIMATION_DELAY = 80;
    protected static final int CURRENT_POINT_OPACITY = 160;
    protected static final int MAX_RESULT_POINTS = 20;
    protected static final int POINT_SIZE = 6;
    protected CameraPreview cameraPreview;
    protected Rect framingRect;
    protected final int laserColor;
    protected List<ResultPoint> lastPossibleResultPoints;
    protected final int maskColor;
    protected final Paint paint;
    protected List<ResultPoint> possibleResultPoints;
    protected Rect previewFramingRect;
    protected Bitmap resultBitmap;
    protected final int resultColor;
    protected final int resultPointColor;
    protected int scannerAlpha;
    protected static final String TAG = ViewfinderView.class.getSimpleName();
    protected static final int[] SCANNER_ALPHA = {0, 64, 128, 192, 255, 192, 128, 64};

    public ViewfinderView(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.paint = new Paint(1);
        Resources resources = getResources();
        TypedArray attributes = getContext().obtainStyledAttributes(attrs, R.styleable.zxing_finder);
        this.maskColor = attributes.getColor(R.styleable.zxing_finder_zxing_viewfinder_mask, resources.getColor(R.color.zxing_viewfinder_mask));
        this.resultColor = attributes.getColor(R.styleable.zxing_finder_zxing_result_view, resources.getColor(R.color.zxing_result_view));
        this.laserColor = attributes.getColor(R.styleable.zxing_finder_zxing_viewfinder_laser, resources.getColor(R.color.zxing_viewfinder_laser));
        this.resultPointColor = attributes.getColor(R.styleable.zxing_finder_zxing_possible_result_points, resources.getColor(R.color.zxing_possible_result_points));
        attributes.recycle();
        this.scannerAlpha = 0;
        this.possibleResultPoints = new ArrayList(20);
        this.lastPossibleResultPoints = new ArrayList(20);
    }

    public void setCameraPreview(CameraPreview view) {
        this.cameraPreview = view;
        view.addStateListener(new CameraPreview.StateListener() { // from class: com.journeyapps.barcodescanner.ViewfinderView.1
            @Override // com.journeyapps.barcodescanner.CameraPreview.StateListener
            public void previewSized() {
                ViewfinderView.this.refreshSizes();
                ViewfinderView.this.invalidate();
            }

            @Override // com.journeyapps.barcodescanner.CameraPreview.StateListener
            public void previewStarted() {
            }

            @Override // com.journeyapps.barcodescanner.CameraPreview.StateListener
            public void previewStopped() {
            }

            @Override // com.journeyapps.barcodescanner.CameraPreview.StateListener
            public void cameraError(Exception error) {
            }

            @Override // com.journeyapps.barcodescanner.CameraPreview.StateListener
            public void cameraClosed() {
            }
        });
    }

    protected void refreshSizes() {
        CameraPreview cameraPreview = this.cameraPreview;
        if (cameraPreview == null) {
            return;
        }
        Rect framingRect = cameraPreview.getFramingRect();
        Rect previewFramingRect = this.cameraPreview.getPreviewFramingRect();
        if (framingRect != null && previewFramingRect != null) {
            this.framingRect = framingRect;
            this.previewFramingRect = previewFramingRect;
        }
    }

    @Override // android.view.View
    public void onDraw(Canvas canvas) {
        refreshSizes();
        if (this.framingRect == null || this.previewFramingRect == null) {
            return;
        }
        Rect frame = this.framingRect;
        Rect previewFrame = this.previewFramingRect;
        int width = canvas.getWidth();
        int height = canvas.getHeight();
        this.paint.setColor(this.resultBitmap != null ? this.resultColor : this.maskColor);
        canvas.drawRect(0.0f, 0.0f, width, frame.top, this.paint);
        canvas.drawRect(0.0f, frame.top, frame.left, frame.bottom + 1, this.paint);
        canvas.drawRect(frame.right + 1, frame.top, width, frame.bottom + 1, this.paint);
        canvas.drawRect(0.0f, frame.bottom + 1, width, height, this.paint);
        if (this.resultBitmap == null) {
            this.paint.setColor(this.laserColor);
            Paint paint = this.paint;
            int[] iArr = SCANNER_ALPHA;
            paint.setAlpha(iArr[this.scannerAlpha]);
            this.scannerAlpha = (this.scannerAlpha + 1) % iArr.length;
            int middle = (frame.height() / 2) + frame.top;
            canvas.drawRect(frame.left + 2, middle - 1, frame.right - 1, middle + 2, this.paint);
            float scaleX = frame.width() / previewFrame.width();
            float scaleY = frame.height() / previewFrame.height();
            int frameLeft = frame.left;
            int frameTop = frame.top;
            if (!this.lastPossibleResultPoints.isEmpty()) {
                this.paint.setAlpha(80);
                this.paint.setColor(this.resultPointColor);
                for (Iterator<ResultPoint> it = this.lastPossibleResultPoints.iterator(); it.hasNext(); it = it) {
                    ResultPoint point = it.next();
                    canvas.drawCircle(((int) (point.getX() * scaleX)) + frameLeft, ((int) (point.getY() * scaleY)) + frameTop, 3.0f, this.paint);
                }
                this.lastPossibleResultPoints.clear();
            }
            if (!this.possibleResultPoints.isEmpty()) {
                this.paint.setAlpha(CURRENT_POINT_OPACITY);
                this.paint.setColor(this.resultPointColor);
                for (Iterator<ResultPoint> it2 = this.possibleResultPoints.iterator(); it2.hasNext(); it2 = it2) {
                    ResultPoint point2 = it2.next();
                    canvas.drawCircle(((int) (point2.getX() * scaleX)) + frameLeft, ((int) (point2.getY() * scaleY)) + frameTop, 6.0f, this.paint);
                }
                List<ResultPoint> temp = this.possibleResultPoints;
                List<ResultPoint> list = this.lastPossibleResultPoints;
                this.possibleResultPoints = list;
                this.lastPossibleResultPoints = temp;
                list.clear();
            }
            postInvalidateDelayed(ANIMATION_DELAY, frame.left - 6, frame.top - 6, frame.right + 6, frame.bottom + 6);
            return;
        }
        this.paint.setAlpha(CURRENT_POINT_OPACITY);
        canvas.drawBitmap(this.resultBitmap, (Rect) null, frame, this.paint);
    }

    public void drawViewfinder() {
        Bitmap resultBitmap = this.resultBitmap;
        this.resultBitmap = null;
        if (resultBitmap != null) {
            resultBitmap.recycle();
        }
        invalidate();
    }

    public void drawResultBitmap(Bitmap result) {
        this.resultBitmap = result;
        invalidate();
    }

    public void addPossibleResultPoint(ResultPoint point) {
        if (this.possibleResultPoints.size() < 20) {
            this.possibleResultPoints.add(point);
        }
    }
}
